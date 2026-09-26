import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../app/api/transcribe/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

// Run the actual handler with an isolated environment and a mocked provider.
function loadHandler(fetch, key = 'test-only-key') {
  const exports = {}
  runInNewContext(compiled, {
    exports,
    require: createRequire(import.meta.url),
    process: { env: { GROQ_API_KEY: key } },
    fetch,
    File,
    FormData,
    AbortSignal,
    Error,
    console: { error() {} },
  })
  return exports.POST
}

function recordingRequest(type = 'audio/webm', name = 'recording.webm') {
  const form = new FormData()
  form.append('audio', new Blob([new Uint8Array(2048)], { type }), name)
  return new Request('http://localhost/api/transcribe', { method: 'POST', body: form })
}

test('preserves MP4 recording metadata and returns the transcript', async () => {
  const handler = loadHandler(async (url, options) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/audio/transcriptions')
    const audio = options.body.get('file')
    assert.equal(audio.name, 'recording.mp4')
    assert.equal(audio.type, 'audio/mp4')
    assert.equal(audio.size, 2048)
    assert.ok(options.signal instanceof AbortSignal)
    return Response.json({ text: ' My answer. ', words: [] })
  })
  const response = await handler(recordingRequest('audio/mp4', 'recording.mp4'))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).text, 'My answer.')
})

test('reports an invalid provider key as configuration failure, without leaking the provider body', async () => {
  const handler = loadHandler(async () => Response.json({ error: 'provider-private-details' }, { status: 401 }))
  const response = await handler(recordingRequest())
  const data = await response.json()
  assert.equal(response.status, 503)
  assert.equal(data.code, 'TRANSCRIPTION_AUTH_ERROR')
  assert.match(data.error, /key is invalid/i)
  assert.doesNotMatch(JSON.stringify(data), /provider-private-details|test-only-key/)
})

test('rejects missing keys and invalid uploads before contacting the provider', async () => {
  let calls = 0
  const provider = async () => { calls++; throw new Error('Unexpected provider call') }
  const missingKey = await loadHandler(provider, '   ')(recordingRequest())
  assert.equal(missingKey.status, 503)
  assert.equal((await missingKey.json()).code, 'TRANSCRIPTION_NOT_CONFIGURED')

  const handler = loadHandler(provider)
  for (const audio of [null, 'not a file', new Blob([])]) {
    const body = new FormData()
    if (audio !== null) body.append('audio', audio)
    const response = await handler(new Request('http://localhost/api/transcribe', { method: 'POST', body }))
    assert.equal(response.status, 400)
  }
  const malformed = await handler(new Request('http://localhost/api/transcribe', { method: 'POST', body: 'not multipart' }))
  assert.equal(malformed.status, 400)
  assert.equal(calls, 0)
})

test('distinguishes rate limits, access errors, unusable recordings, and service outages', async () => {
  for (const [upstreamStatus, expectedStatus, code] of [
    [429, 429, 'TRANSCRIPTION_RATE_LIMIT'],
    [403, 503, 'TRANSCRIPTION_ACCESS_DENIED'],
    [400, 422, 'INVALID_RECORDING'],
    [500, 502, 'TRANSCRIPTION_UNAVAILABLE'],
  ]) {
    const handler = loadHandler(async () => new Response('', { status: upstreamStatus }))
    const response = await handler(recordingRequest())
    assert.equal(response.status, expectedStatus)
    assert.equal((await response.json()).code, code)
  }
})

test('returns a retryable timeout without exposing internal errors', async () => {
  const handler = loadHandler(async () => {
    const error = new Error('private timeout details')
    error.name = 'TimeoutError'
    throw error
  })
  const response = await handler(recordingRequest())
  assert.equal(response.status, 504)
  const data = await response.json()
  assert.equal(data.code, 'TRANSCRIPTION_TIMEOUT')
  assert.doesNotMatch(data.error, /private timeout details/)
})

test('does not accept empty speech or malformed provider responses as successful transcriptions', async () => {
  for (const [payload, expectedStatus] of [[{ text: '  ' }, 422], [{ unexpected: true }, 502], [null, 502]]) {
    const response = await loadHandler(async () => Response.json(payload))(recordingRequest())
    assert.equal(response.status, expectedStatus)
    assert.equal(typeof (await response.json()).error, 'string')
  }
})
