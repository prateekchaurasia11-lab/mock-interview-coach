import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 })
    }

    const fd = new FormData()
    fd.append('file', audioFile, 'recording.webm')
    fd.append('model', 'whisper-large-v3-turbo')
    fd.append('response_format', 'verbose_json')
    fd.append('language', 'en')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: fd,
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Transcription failed: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ text: data.text ?? '', words: data.words ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}