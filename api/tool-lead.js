/**
 * POST /api/tool-lead
 * Used by the interactive tools (Overthinking Score, Thought Reframer, Procrastination Breaker,
 * 30-Day Action Planner). Sends the person a short guide by email (Resend) and, only if they
 * ticked the box, adds them to the newsletter contacts.
 *
 * Body: { tool, email, result?, consent?, website? }
 *   tool    one of the keys in _lib/toolContent.js
 *   result  a short result key from that file (never free text)
 *   website honeypot, real visitors leave it empty
 *
 * ENV VARS: RESEND_API_KEY (full access), EMAIL_FROM (optional), RESEND_SEGMENT_ID (optional)
 */
import { layout, h1, p, button, callout, esc, SITE, SUPPORT } from './_lib/emailTemplates.js'
import { addToNewsletter } from './_lib/newsletter.js'
import { TOOLS } from './_lib/toolContent.js'

// Simple limits so the form cannot be used to flood an inbox (per server instance).
const hits = new Map()
function tooMany(key, max, windowMs) {
  const now = Date.now()
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs)
  list.push(now)
  hits.set(key, list)
  return list.length > max
}

function guideEmail(tool, resultKey) {
  const t = TOOLS[tool]
  const r = t.results[resultKey]
  const subject = `Your guide: ${t.title}`

  const body =
    h1(`Your guide: ${esc(t.title)}`) +
    p(`Thank you for using the ${esc(t.title)}, a companion tool of the book <em>${esc(t.book)}</em>.`) +
    (r ? callout(`Your result: ${esc(r.name)}`, esc(r.tip)) : '') +
    callout('Three steps for this week', t.steps.map((x) => `· ${esc(x)}`).join('<br />')) +
    button(`${SITE}${t.url}`, 'Back to the tool') +
    p('If you would like to talk it through, a free Discovery Session is always open. Just reply to this email.') +
    p(`If you have read <em>${esc(t.book)}</em> and it helped you, an honest review on Amazon takes a minute and helps other readers find it. <a href="${t.amazon}" style="color:#005575;">Leave a review</a>. Thank you.`) +
    p('Angelo')

  const html = layout({ preheader: `Your guide from ${t.title}`, title: subject, body })
  const text = `Your guide: ${t.title}

Thank you for using the ${t.title}, a companion tool of the book "${t.book}".
${r ? `\nYour result: ${r.name}\n${r.tip}\n` : ''}
Three steps for this week:
${t.steps.map((x) => `- ${x}`).join('\n')}

Back to the tool: ${SITE}${t.url}

If you would like to talk it through, a free Discovery Session is always open. Just reply to this email.

If you have read "${t.book}" and it helped you, an honest review on Amazon takes a minute and helps other readers find it: ${t.amazon}
Thank you.
Angelo

Come Alive Studio - Support Team
${SITE}
${SUPPORT}`
  return { subject, html, text }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://app.comealive.vision')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { tool, email: rawEmail, result, consent, website } = req.body || {}

    // Bots fill the hidden field: pretend it worked.
    if (website) return res.status(200).json({ ok: true })

    const email = String(rawEmail || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }
    if (!TOOLS[tool]) return res.status(400).json({ error: 'Unknown tool' })
    const resultKey = Object.prototype.hasOwnProperty.call(TOOLS[tool].results, result) ? result : ''

    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
    if (tooMany(`ip:${ip}`, 6, 3600000) || tooMany(`mail:${email}:${tool}`, 2, 86400000)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }

    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')

    const { subject, html, text } = guideEmail(tool, resultKey)
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Come Alive Studio <noreply@comealive.vision>',
        reply_to: SUPPORT,
        to: [email],
        subject,
        html,
        text,
      }),
    })
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`)

    let subscribed = false
    if (consent === true) {
      try {
        subscribed = await addToNewsletter(email, '')
      } catch (err) {
        console.error('Newsletter error:', err.message)
      }
    }

    return res.status(200).json({ ok: true, subscribed })
  } catch (err) {
    console.error('Tool lead error:', err.message)
    return res.status(500).json({ error: 'We could not send the email. Please try again.' })
  }
}
