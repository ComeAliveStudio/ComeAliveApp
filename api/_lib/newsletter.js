// Newsletter contacts in Resend, shared by /api/welcome and /api/tool-lead.
// Same approach as FilmJourney: Resend contacts, optionally inside a segment.
// A person who unsubscribed earlier is never subscribed again.
export async function addToNewsletter(email, name) {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  const segmentId = process.env.RESEND_SEGMENT_ID

  const existing = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, { headers })
  if (existing.ok) {
    const contact = await existing.json()
    if (contact?.unsubscribed) {
      console.log('Newsletter: contact unsubscribed earlier, not added again')
      return false
    }
    // Contacts are shared by every project in the Resend account (Riga Brothers, FilmJourney...).
    // An existing contact only has to be added to this project's segment.
    if (segmentId) {
      const seg = await fetch(
        `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
        { method: 'POST', headers }
      )
      if (!seg.ok) throw new Error(`Resend segment ${seg.status}: ${await seg.text()}`)
    }
    console.log('Newsletter: existing contact added to the segment')
    return true
  }

  const first = String(name || '').trim().split(/\s+/)[0]
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
  if (r.ok) {
    console.log('Newsletter: new contact created')
    return true
  }
  if (r.status === 409) return true // created by another request in the meantime
  throw new Error(`Resend contacts ${r.status}: ${await r.text()}`)
}
