/**
 * POST /api/welcome
 * Called by the app right after a confirmed sign-in (Authorization: Bearer <access token>).
 *
 * For a NEW account (created in the last 3 days) it:
 *   1. makes sure there is a row in `members` (free "explorer" plan)
 *   2. sends the welcome email through Resend, once
 *   3. adds the person to the Resend newsletter contacts, only if they ticked the newsletter box
 *
 * Why after sign-in and not at sign-up: the email address is confirmed by then,
 * so nobody can make us send emails to an address that is not theirs.
 *
 * ENV VARS (Vercel > Settings > Environment Variables):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   already used by the Stripe webhook
 *   RESEND_API_KEY                            Resend, domain comealive.vision
 *   EMAIL_FROM                                optional, default "Come Alive Studio <noreply@comealive.vision>"
 *   RESEND_SEGMENT_ID                         optional, the Resend segment "Come Alive Newsletter"
 */
import { createClient } from '@supabase/supabase-js'
import { welcomeEmail, SUPPORT } from './_lib/emailTemplates.js'

const NEW_ACCOUNT_DAYS = 3

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function sendWelcome(to, name, newsletter) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  const { subject, html, text } = welcomeEmail({ name, newsletter })
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Come Alive Studio <noreply@comealive.vision>',
      reply_to: SUPPORT,
      to: [to],
      subject,
      html,
      text,
    }),
  })
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`)
}

// Same approach as FilmJourney: Resend contacts, optionally inside a segment.
// A person who unsubscribed earlier is never subscribed again.
async function addToNewsletter(email, name) {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  const existing = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, { headers })
  if (existing.ok) {
    const contact = await existing.json()
    if (contact?.unsubscribed) return false
  }

  const first = String(name || '').trim().split(/\s+/)[0]
  const segmentId = process.env.RESEND_SEGMENT_ID
  const r = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      ...(first ? { first_name: first } : {}),
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    }),
  })
  if (r.ok || r.status === 409) return true // 409: already a contact
  throw new Error(`Resend contacts ${r.status}: ${await r.text()}`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'Missing token' })

    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    const user = userData?.user
    if (userError || !user?.email) return res.status(401).json({ error: 'Invalid token' })

    const email = user.email.trim().toLowerCase()
    const meta = user.user_metadata || {}
    const name = String(meta.full_name || '').slice(0, 120)
    const newsletter = meta.newsletter_consent === true

    // 1. member row
    const { data: existing, error: findError } = await supabase
      .from('members')
      .select('id, welcome_sent_at')
      .ilike('email', email)
      .maybeSingle()
    if (findError) throw new Error(`members lookup: ${findError.message}`)

    let member = existing
    if (!member) {
      const { data: created, error: insertError } = await supabase
        .from('members')
        .insert({ email, plan: 'explorer', full_name: name || null, newsletter_consent: newsletter })
        .select('id, welcome_sent_at')
        .single()
      if (insertError) throw new Error(`members insert: ${insertError.message}`)
      member = created
    }

    // Already welcomed, or an older account (e.g. a paying member): nothing to send.
    const ageDays = (Date.now() - new Date(user.created_at).getTime()) / 86400000
    if (member.welcome_sent_at || ageDays > NEW_ACCOUNT_DAYS) {
      return res.status(200).json({ ok: true, welcomed: false })
    }

    // 2. claim the welcome first (so two open tabs cannot send it twice), then send
    const { data: claimed, error: claimError } = await supabase
      .from('members')
      .update({ welcome_sent_at: new Date().toISOString() })
      .eq('id', member.id)
      .is('welcome_sent_at', null)
      .select('id')
    if (claimError) throw new Error(`claim: ${claimError.message}`)
    if (!claimed?.length) return res.status(200).json({ ok: true, welcomed: false })

    try {
      await sendWelcome(email, name, newsletter)
    } catch (err) {
      await supabase.from('members').update({ welcome_sent_at: null }).eq('id', member.id)
      throw err
    }

    // 3. newsletter (never blocks the welcome)
    let subscribed = false
    if (newsletter) {
      try {
        subscribed = await addToNewsletter(email, name)
      } catch (err) {
        console.error('Newsletter error:', err.message)
      }
    }

    return res.status(200).json({ ok: true, welcomed: true, subscribed })
  } catch (err) {
    console.error('Welcome error:', err.message)
    return res.status(500).json({ error: 'Could not complete welcome' })
  }
}
