import React from 'react'
import { useState, useEffect } from 'react'
import { BOOKS } from './exercisesData.js'

// Answers are kept on the person's device only (localStorage), never sent anywhere.
const KEY = 'bookExercises.v1'

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function writeAll(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)) } catch { /* private mode: keep going without saving */ }
}

function fieldsOf(ex) {
  const out = []
  for (const b of ex.blocks) {
    if (b.t === 'q') out.push({ id: b.id, label: b.text })
    if (b.t === 'row') b.fields.forEach(f => out.push({ id: f.id, label: f.label }))
  }
  return out
}

function plainText(book, ex, answers) {
  let t = `${ex.title}\nFrom "${book.title}" by Angelo D'Agostino\n\n`
  for (const f of fieldsOf(ex)) {
    t += `${f.label}\n${(answers[f.id] || '').trim() || '(blank)'}\n\n`
  }
  return t
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function printExercise(book, ex, answers) {
  const w = window.open('', '_blank')
  if (!w) return
  let body = `<h1>${esc(ex.title)}</h1><p class="src">From <em>${esc(book.title)}</em> by Angelo D'Agostino</p>`
  for (const f of fieldsOf(ex)) {
    body += `<div class="f"><div class="l">${esc(f.label)}</div><div class="a">${esc((answers[f.id] || '').trim())}</div></div>`
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(ex.title)}</title><style>
body{font-family:Georgia,serif;color:#1d1d1b;max-width:680px;margin:32px auto;padding:0 20px;line-height:1.5}
h1{color:#005575;font-weight:400}.src{color:#555;font-size:14px}.f{margin:18px 0;page-break-inside:avoid}
.l{font-size:13px;color:#005575;font-weight:bold}.a{min-height:48px;border-bottom:1px solid #999;white-space:pre-wrap;padding:4px 0}
</style></head><body>${body}</body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

function download(name, text) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const inputStyle = {
  width: '100%', padding: '0.7rem 0.8rem', borderRadius: 6,
  border: '1px solid rgba(0,85,117,0.35)', background: '#fff', color: '#1d1d1b',
  fontFamily: 'inherit', fontSize: '0.9rem',
}

function Exercise({ book, ex, answers, setAnswer }) {
  const [open, setOpen] = useState(false)
  const val = id => answers[id] || ''
  return (
    <div className="light-surface" style={{ background: '#fff', border: '1px solid rgba(215,229,232,0.7)', borderRadius: 8, marginBottom: '0.8rem' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '1.1rem 1.3rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
      >
        <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.35rem', color: 'var(--gold)' }}>{ex.title}</span>
        <span style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>{open ? '-' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.3rem 1.3rem', color: 'var(--card-text)', fontSize: '0.92rem', lineHeight: 1.65 }}>
          <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>{ex.intro}</p>
          {ex.blocks.map((b, i) => {
            if (b.t === 'h') return <div key={i} style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', color: 'var(--gold)', margin: '1.2rem 0 0.4rem' }}>{b.text}</div>
            if (b.t === 'p') return <p key={i} style={{ margin: '0.5rem 0' }}>{b.text}</p>
            if (b.t === 'ul') return <ul key={i} style={{ margin: '0.5rem 0 0.5rem 1.2rem' }}>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul>
            if (b.t === 'q') return (
              <div key={i} style={{ margin: '0.9rem 0' }}>
                <label htmlFor={b.id} style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>{b.text}</label>
                <textarea id={b.id} rows={b.rows || 3} value={val(b.id)} onChange={e => setAnswer(b.id, e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            )
            if (b.t === 'row') return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${b.fields.length > 2 ? 150 : 200}px, 1fr))`, gap: '0.6rem', margin: '0.9rem 0' }}>
                {b.fields.map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} style={{ display: 'block', fontSize: '0.8rem', marginBottom: 3 }}>{f.label}</label>
                    <input id={f.id} type={f.kind === 'number' ? 'number' : 'text'} {...(f.kind === 'number' ? { min: 1, max: 10 } : {})} value={val(f.id)} onChange={e => setAnswer(f.id, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            )
            return null
          })}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
            <button className="btn-primary" onClick={() => printExercise(book, ex, answers)}>Print or save as PDF</button>
            <button className="btn-ghost" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }} onClick={() => download(`${ex.id}.txt`, plainText(book, ex, answers))}>Download .txt</button>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.8rem', opacity: 0.8 }}>Your answers stay on this device and are not sent to us.</p>
        </div>
      )}
    </div>
  )
}

export function ExercisesList() {
  const [answers, setAnswers] = useState(readAll)
  useEffect(() => { writeAll(answers) }, [answers])
  const setAnswer = (id, v) => setAnswers(a => ({ ...a, [id]: v }))

  return (
    <div style={{ maxWidth: 820 }}>
      {BOOKS.map(book => (
        <section key={book.id} style={{ marginBottom: '2.6rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', fontWeight: 400, color: '#f6f3f0', marginBottom: '0.2rem' }}>{book.title}</h3>
          <p style={{ color: 'rgba(246,243,240,0.85)', fontSize: '0.88rem', marginBottom: '1rem' }}>{book.blurb}</p>
          {book.exercises.map(ex => <Exercise key={ex.id} book={book} ex={ex} answers={answers} setAnswer={setAnswer} />)}
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <a className="btn-primary" href={book.amazon} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Get the full book on Amazon</a>
            <a className="btn-ghost" href={book.tool.href} style={{ textDecoration: 'none' }}>{book.tool.label}</a>
          </div>
        </section>
      ))}
    </div>
  )
}

export function ExercisesPage({ user, onSignIn }) {
  return (
    <div style={{ background: '#4f889f', paddingTop: '6rem', minHeight: '100vh' }}>
      <div className="max-w" style={{ padding: '4rem 3rem' }}>
        <div className="section-label">Book Exercises</div>
        <h2>Exercises <em>from the books</em></h2>
        <p style={{ color: 'rgba(246,243,240,0.85)', marginBottom: '2rem', fontSize: '0.9rem', maxWidth: 560 }}>
          Guided exercises taken from the bonus sections of the books. Free with your Explorer account. Fill them in on screen, then print or save them.
        </p>
        {user ? <ExercisesList /> : (
          <div className="light-surface" style={{ background: '#dbe8eb', padding: '1.6rem', maxWidth: 560, borderRadius: 8 }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '0.4rem' }}>Create your free account</div>
            <p style={{ color: 'var(--card-text)', fontSize: '0.9rem', marginBottom: '1rem' }}>Sign in with your email, there is no password to remember, and the exercises unlock right away.</p>
            <button className="btn-primary" onClick={onSignIn}>Sign in or create account</button>
          </div>
        )}
      </div>
    </div>
  )
}
