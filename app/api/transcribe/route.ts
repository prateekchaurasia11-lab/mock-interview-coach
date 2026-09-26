import { NextResponse } from 'next/server'

function extensionFromType(type: string) {
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('ogg')) return 'ogg'
  if (type.includes('mpeg')) return 'mp3'
  if (type.includes('wav')) return 'wav'
  return 'webm'
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Upload a recording to transcribe.' }, { status: 400 })
  }

  try {
    const audioFile = formData.get('audio')

    if (!(audioFile instanceof File) || audioFile.size === 0) {
      return NextResponse.json({ error: 'No audio file was provided.' }, { status: 400 })
    }

    const groqKey = process.env.GROQ_API_KEY?.trim()
    if (!groqKey) {
      return NextResponse.json(
        { error: 'Voice transcription is unavailable because the Groq API key is missing.', code: 'TRANSCRIPTION_NOT_CONFIGURED' },
        { status: 503 },
      )
    }

    const fallbackName = `recording.${extensionFromType(audioFile.type)}`
    const fileName = audioFile.name.includes('.') ? audioFile.name : fallbackName
    const groqForm = new FormData()
    groqForm.append('file', audioFile, fileName)
    groqForm.append('model', 'whisper-large-v3-turbo')
    groqForm.append('response_format', 'verbose_json')
    groqForm.append('language', 'en')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: groqForm,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      console.error('Groq transcription failed with status:', response.status)

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Voice transcription is unavailable because the configured Groq API key is invalid. Update the key and retry.', code: 'TRANSCRIPTION_AUTH_ERROR' },
          { status: 503 },
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'The configured Groq account does not have access to voice transcription.', code: 'TRANSCRIPTION_ACCESS_DENIED' },
          { status: 503 },
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'The transcription usage limit was reached. Wait a little, then retry this recording.', code: 'TRANSCRIPTION_RATE_LIMIT' },
          { status: 429 },
        )
      }

      if ([400, 413, 415, 422].includes(response.status)) {
        return NextResponse.json(
          { error: 'The transcription service could not read this recording. Please record a new answer.', code: 'INVALID_RECORDING' },
          { status: 422 },
        )
      }

      return NextResponse.json(
        { error: 'The transcription service is temporarily unavailable. Please retry this recording.', code: 'TRANSCRIPTION_UNAVAILABLE' },
        { status: 502 },
      )
    }

    const data = await response.json()
    if (typeof data?.text !== 'string') {
      return NextResponse.json(
        { error: 'The transcription service returned an invalid response. Please retry this recording.' },
        { status: 502 },
      )
    }

    if (!data.text.trim()) {
      return NextResponse.json(
        { error: 'No speech was detected. Please record again and speak clearly.', code: 'NO_SPEECH' },
        { status: 422 },
      )
    }

    return NextResponse.json({ text: data.text.trim(), words: Array.isArray(data.words) ? data.words : [] })
  } catch (error) {
    if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) {
      return NextResponse.json(
        { error: 'Transcription timed out. Please retry this recording.', code: 'TRANSCRIPTION_TIMEOUT' },
        { status: 504 },
      )
    }

    console.error('Transcription request failed:', error instanceof Error ? error.name : 'UnknownError')
    return NextResponse.json(
      { error: 'Could not reach the transcription service. Please retry this recording.', code: 'TRANSCRIPTION_UNAVAILABLE' },
      { status: 502 },
    )
  }
}
