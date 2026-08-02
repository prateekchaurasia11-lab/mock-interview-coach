'use client'
import { useState, useRef, useEffect } from 'react'

type Props = {
  onRecordingDone: (blob: Blob) => void
  onReset: () => void
}

export default function Recorder({ onRecordingDone, onReset }: Props) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'done'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  async function startRecording() {
    setPermissionError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRef.current = recorder
      chunksRef.current = []
      setSeconds(0)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setStatus('done')
        onRecordingDone(blob)
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
      }

      recorder.start(250)
      setStatus('recording')

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 119) { stopRecording(); return 120 }
          return s + 1
        })
      }, 1000)
    } catch (err) {
      setPermissionError(true)
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
    setAudioUrl(null)
    setSeconds(0)
    setPermissionError(false)
    chunksRef.current = []
    onReset()
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="recorder-wrap">
      {permissionError && (
        <div className="error-banner">
          Microphone access denied. Allow mic in browser settings and try again.
        </div>
      )}

      {status === 'idle' && (
        <button className="btn-record" onClick={startRecording}>
          <span className="rec-dot" />
          Record Answer
        </button>
      )}

      {status === 'recording' && (
        <div className="recording-ui">
          <div className="rec-pulse">
            <span className="rec-dot live" />
            <span className="rec-label">Recording — {formatTime(seconds)}</span>
          </div>
          <button className="btn-stop" onClick={stopRecording}>Stop Recording</button>
          <p className="rec-hint">Max 2 minutes · Speak clearly in English</p>
        </div>
      )}

      {status === 'done' && audioUrl && (
        <div className="done-ui">
          <p className="done-label">✓ Recording complete — {formatTime(seconds)}</p>
          <audio controls src={audioUrl} className="audio-player" />
          <button className="btn-rerecord" onClick={reset}>Re-record</button>
        </div>
      )}
    </div>
  )
}