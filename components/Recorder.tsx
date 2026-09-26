'use client'
import { useState, useRef, useEffect } from 'react'

type Props = {
  onRecordingDone: (blob: Blob) => void
  onReset: () => void
}

function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]

  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

export default function Recorder({ onRecordingDone, onReset }: Props) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'done'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [audioUrl])

  async function startRecording() {
    setRecordingError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : undefined
      const recorder = new MediaRecorder(stream, options)

      mediaRef.current = recorder
      chunksRef.current = []
      setSeconds(0)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blobType = recorder.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: blobType })

        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        if (timerRef.current) clearInterval(timerRef.current)

        if (blob.size < 1024) {
          setStatus('idle')
          setRecordingError('That recording was too short. Please try once more.')
          return
        }

        const url = URL.createObjectURL(blob)
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(url)
        setStatus('done')
        onRecordingDone(blob)
      }

      recorder.start(1000)
      setStatus('recording')

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 119) {
            stopRecording()
            return 120
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setRecordingError('Microphone access failed. Allow mic access in the browser and try again.')
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state === 'recording') {
      mediaRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function reset() {
    setStatus('idle')
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setSeconds(0)
    setRecordingError(null)
    chunksRef.current = []
    onReset()
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="recorder-wrap">
      {recordingError && (
        <div className="error-banner">
          {recordingError}
        </div>
      )}

      {status === 'idle' && (
        <button className="btn-record" onClick={startRecording}>
          <span className="rec-dot" />
          Record answer
        </button>
      )}

      {status === 'recording' && (
        <div className="recording-ui">
          <div className="rec-pulse">
            <span className="rec-dot live" />
            <span className="rec-label">Recording - {formatTime(seconds)}</span>
          </div>
          <button className="btn-stop" onClick={stopRecording}>Stop recording</button>
          <p className="rec-hint">Max 2 minutes. Speak clearly in English.</p>
        </div>
      )}

      {status === 'done' && audioUrl && (
        <div className="done-ui">
          <p className="done-label">Recording complete - {formatTime(seconds)}</p>
          <audio controls src={audioUrl} className="audio-player" />
          <button className="btn-rerecord" onClick={reset}>Re-record</button>
        </div>
      )}
    </div>
  )
}
