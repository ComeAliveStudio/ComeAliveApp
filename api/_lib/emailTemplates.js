// Shared look for every Come Alive Studio email.
// Colours and fonts follow app.comealive.vision: azure #005575 header, parchment page,
// Cormorant Garamond headings, Outfit body (with safe fallbacks for email clients).
// The folder name starts with an underscore, so Vercel does not deploy it as a function.

export const SITE = 'https://app.comealive.vision'
export const SUPPORT = 'office@comealive.vision'

const AZURE = '#005575'
const INK = '#1d1d1b'
const PARCHMENT = '#f6f3f0'
const PALE = '#dbe8eb'
const MUTED = '#5b6b70'
const LINE = '#d7e5e8'
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif"
const SANS = "'Outfit',Arial,Helvetica,sans-serif"

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const p = (html) =>
  `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:16px;line-height:25px;color:${INK};">${html}</p>`

export const h1 = (html) =>
  `<h1 style="margin:0 0 16px 0;font-family:${SERIF};font-size:32px;line-height:38px;font-weight:400;color:${AZURE};">${html}</h1>`

export function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;"><tr>
<td bgcolor="${AZURE}" style="background-color:${AZURE};border-radius:2px;"><a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:13px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${label}</a></td>
</tr></table>`
}

export function callout(title, html) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;"><tr>
<td bgcolor="${PALE}" style="background-color:${PALE};border-left:4px solid ${AZURE};padding:16px 20px;font-family:${SANS};font-size:15px;line-height:24px;color:${INK};"><strong style="color:${AZURE};">${title}</strong><br />${html}</td>
</tr></table>`
}

export const small = (html) =>
  `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:13px;line-height:21px;color:${MUTED};">${html}</p>`

// preheader: hidden preview text. body: inner HTML. footerNote: optional extra line (e.g. unsubscribe).
export function layout({ preheader = '', title = 'Come Alive Studio', body, footerNote = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
<style>:root { color-scheme: light only; supported-color-schemes: light only; }</style>
</head>
<body style="margin:0;padding:0;background-color:${PARCHMENT};" bgcolor="${PARCHMENT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PARCHMENT}" style="background-color:${PARCHMENT};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:560px;background-color:#ffffff;border:1px solid ${LINE};">
<tr><td bgcolor="${AZURE}" style="background-color:${AZURE};padding:20px 32px;font-family:${SERIF};font-size:22px;letter-spacing:0.15em;text-transform:uppercase;color:${PARCHMENT};"><img src="${SITE}/images/logo-mark.png" alt="" width="34" height="37" style="display:inline-block;vertical-align:middle;border:0;margin-right:12px;" /><span style="vertical-align:middle;">Come Alive Studio</span></td></tr>
<tr><td style="padding:36px 32px 12px 32px;">
${body}
</td></tr>
<tr><td style="padding:0 32px 32px 32px;border-top:1px solid ${LINE};">
<p style="margin:20px 0 4px 0;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:${AZURE};">Come Alive Studio</p>
<p style="margin:0 0 6px 0;font-family:${SANS};font-size:14px;font-weight:500;color:${INK};">Support Team</p>
<p style="margin:0 0 4px 0;font-family:${SANS};font-size:12px;line-height:19px;color:${MUTED};">Coaching, courses and frameworks · Vienna</p>
<p style="margin:0 0 12px 0;font-family:${SANS};font-size:12px;"><a href="${SITE}" style="color:${AZURE};text-decoration:none;">app.comealive.vision</a></p>
<p style="margin:0 0 8px 0;font-family:${SANS};font-size:12px;line-height:19px;color:${MUTED};">Questions? Reply to this email or write to <a href="mailto:${SUPPORT}" style="color:${AZURE};">${SUPPORT}</a></p>
${footerNote}
<p style="margin:0;font-family:${SANS};font-size:11px;line-height:17px;color:#8a979b;">Come Alive Film &amp; Audio Solutions e.U. · Vienna, Austria · <a href="${SITE}/privacy-policy.html" style="color:#8a979b;">Privacy Policy</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`
}

// ── WELCOME (sent once, after the first confirmed sign-in) ──────────────────────
export function welcomeEmail({ name = '', newsletter = false } = {}) {
  const first = String(name).trim().split(/\s+/)[0]
  const subject = 'Welcome to Come Alive Studio'
  const hello = first ? `Welcome, ${esc(first)}.` : 'Welcome.'

  const body =
    h1(hello) +
    p('Your free Explorer account is ready. There is no password to remember: whenever you want to sign in, we send you a one-time link.') +
    callout(
      'Where to start',
      `· Free episodes in all four tracks: Filmmaking, Mindset, Relationships, Growth<br />
· Interactive tools from <em>Your Relationship Guide to Happiness</em><br />
· A free 45 minute Discovery Session with Angelo`
    ) +
    button(`${SITE}/?page=dashboard`, 'Open your dashboard') +
    (newsletter
      ? p('You also asked to receive our newsletter. Expect a few emails a month, with new tools, courses and ideas. You can unsubscribe at any time with the link in each email.')
      : '') +
    p('Glad to have you here.<br />Angelo')

  const html = layout({ preheader: 'Your free account is ready. Here is where to start.', title: subject, body })

  const text = `${first ? `Welcome, ${first}.` : 'Welcome.'}

Your free Explorer account is ready. There is no password to remember: whenever you want to sign in, we send you a one-time link.

Where to start:
- Free episodes in all four tracks: Filmmaking, Mindset, Relationships, Growth
- Interactive tools from Your Relationship Guide to Happiness
- A free 45 minute Discovery Session with Angelo

Open your dashboard: ${SITE}/?page=dashboard
${newsletter ? '\nYou also asked to receive our newsletter. A few emails a month, unsubscribe any time with the link in each email.\n' : ''}
Glad to have you here.
Angelo

Come Alive Studio - Support Team
${SITE}
${SUPPORT}`

  return { subject, html, text }
}

// ── MEMBERSHIP CONFIRMATION (ready to use after a Stripe checkout) ──────────────
const PLANS = {
  founding: {
    label: 'Founding Member',
    perks: ['Everything in Explorer', 'Workbooks and Starter Kit downloads', 'Monthly group live Q&amp;A', 'Progress tracking dashboard'],
  },
  master: {
    label: 'Master Planner',
    perks: ['Everything in Founding Member', '3 private coaching sessions (45 min)', 'Direct messaging access', 'Custom growth roadmap', 'Privileged access to new courses'],
  },
}

export function membershipEmail({ name = '', plan = 'founding' } = {}) {
  const first = String(name).trim().split(/\s+/)[0]
  const info = PLANS[plan] || PLANS.founding
  const subject = `Your membership is active: ${info.label}`

  const body =
    h1(first ? `Thank you, ${esc(first)}.` : 'Thank you.') +
    p(`Your <strong>${info.label}</strong> membership is now active.`) +
    callout('What is included', info.perks.map((x) => `· ${x}`).join('<br />')) +
    button(`${SITE}/?page=dashboard`, 'Go to your dashboard') +
    p(plan === 'master' ? 'Your Master Planner access runs for three months. You can renew from the Billing section of your dashboard whenever you are ready.' : 'You can manage or cancel your subscription at any time from the Billing section of your dashboard.') +
    p('If something does not work, just reply to this email and we will help.')

  const html = layout({ preheader: `Your ${info.label} membership is active.`, title: subject, body })

  const text = `${first ? `Thank you, ${first}.` : 'Thank you.'}

Your ${info.label} membership is now active.

What is included:
${info.perks.map((x) => `- ${x.replace(/&amp;/g, '&')}`).join('\n')}

Go to your dashboard: ${SITE}/?page=dashboard

${plan === 'master' ? 'Your Master Planner access runs for three months. You can renew from the Billing section of your dashboard whenever you are ready.' : 'You can manage or cancel your subscription at any time from the Billing section of your dashboard.'}
If something does not work, just reply to this email and we will help.

Come Alive Studio - Support Team
${SITE}
${SUPPORT}`

  return { subject, html, text }
}
