import React, { useState, useEffect, useRef } from 'react'

// Embedded Q&A chat for the Concierge section (replaces the external widget).
// Talks to /api/chat in "concierge" mode. `ask` is { text, n }: a new n sends that question.

const BOX = '#ffffff'
const TEXT = '#1d1d1b'
const AZURE = '#005575'

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const GREETING = "Hello!\n\nWelcome to the Come Alive Guide.\n\nHow can I help you today?"

export default function ConciergeChat({ ask }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cta, setCta] = useState(null)
  const [sessionId] = useState(uid)
  const bottomRef = useRef(null)
  const listRef = useRef(null)
  const lastAsk = useRef(0)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function send(text) {
    const t = String(text || '').trim()
    if (!t || loading) return
    setMessages(prev => [...prev, { role: 'user', content: t }])
    setInput('')
    setCta(null)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'concierge', sessionId, message: t }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok && !data.reply) throw new Error(`HTTP ${res.status}`)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Something went wrong. Please try again.' }])
      if (data.cta) setCta(data.cta)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  // A chip on the left of the section asks a question here.
  useEffect(() => {
    if (ask && ask.n && ask.n !== lastAsk.current) {
      lastAsk.current = ask.n
      send(ask.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask])

  return (
    <div style={{ border: '1px solid rgba(215,229,232,0.5)', background: BOX, borderRadius: 8, display: 'flex', flexDirection: 'column', height: 520, maxHeight: '75vh' }}>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '88%',
            background: m.role === 'user' ? AZURE : '#dbe8eb',
            color: m.role === 'user' ? '#ffffff' : TEXT,
            borderRadius: 10, padding: '0.6rem 0.85rem', fontSize: '0.88rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
          }}>{m.content}</div>
        ))}
        {loading && <div style={{ alignSelf: 'flex-start', color: AZURE, fontSize: '0.85rem', padding: '0 0.4rem' }}>...</div>}
        {cta && !loading && (
          <a href={cta.url} style={{ alignSelf: 'center', background: AZURE, color: '#ffffff', padding: '0.7rem 1.3rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{cta.text}</a>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: '0.5rem', padding: '0.7rem', borderTop: '1px solid rgba(0,85,117,0.2)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask a question..."
          aria-label="Ask a question"
          disabled={loading}
          style={{ flex: 1, padding: '0.65rem 0.8rem', borderRadius: 6, border: '1px solid rgba(0,85,117,0.35)', background: '#fff', color: TEXT, fontFamily: 'inherit', fontSize: '0.9rem' }}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Send" style={{ background: AZURE, color: '#fff', border: 'none', borderRadius: 6, padding: '0 1rem', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1, fontSize: '1rem' }}>↑</button>
      </form>
    </div>
  )
}
