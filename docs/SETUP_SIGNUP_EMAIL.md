# Registrazione utenti ed email: configurazione

Dopo aver unito la pull request, servono questi passaggi (una volta sola, circa 20 minuti).

## 1. Database (Supabase > SQL Editor)
Incolla ed esegui il contenuto di `supabase/migrations/001_members_signup.sql`.
Aggiunge a `members` le colonne `full_name`, `newsletter_consent`, `welcome_sent_at`.

## 2. Variabili su Vercel (Settings > Environment Variables, Production)
Già presenti: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
Da aggiungere:
- `RESEND_API_KEY`: chiave Resend (dominio comealive.vision già verificato)
- `EMAIL_FROM`: facoltativa, es. `Come Alive Studio <noreply@comealive.vision>`
- `RESEND_SEGMENT_ID`: facoltativa, id del segmento "Come Alive Newsletter" creato in Resend (Contacts > Segments)
Dopo averle salvate, fai Redeploy.

## 3. Email di accesso via Resend (Supabase > Authentication > SMTP Settings)
Abilita Custom SMTP: host `smtp.resend.com`, porta `465`, utente `resend`, password = chiave Resend,
mittente `noreply@comealive.vision`, nome `Come Alive Studio`.
Senza questo passaggio Supabase invia con un servizio di prova dal limite molto basso.

## 4. Template email (Supabase > Authentication > Email Templates)
Copia il contenuto di ogni file in `supabase/email-templates/` nel template corrispondente:

| Template Supabase | File | Oggetto consigliato |
|---|---|---|
| Magic Link | `magic-link.html` | Your sign-in link for Come Alive Studio |
| Confirm signup | `confirm-signup.html` | Confirm your Come Alive Studio account |
| Invite user | `invite-user.html` | You are invited to Come Alive Studio |
| Change Email Address | `change-email.html` | Confirm your new email |
| Reauthentication | `reauthentication.html` | Your confirmation code |
| Reset Password | `reset-password.html` | Reset your Come Alive Studio password |

Nota: un nuovo utente che si registra con il link riceve il template "Confirm signup", chi esiste già riceve "Magic Link".
In Authentication > URL Configuration verifica che Site URL sia `https://app.comealive.vision`.

## 5. Newsletter (Resend)
Come per Riga Brothers e FilmJourney: i contatti stanno in Resend.
In Resend, Contacts > Segments, crea il segmento "Come Alive Newsletter" e copia il suo id in `RESEND_SEGMENT_ID` (Vercel).
Per scrivere una newsletter: Resend > Broadcasts > Create, scegli il segmento e incolla il contenuto di
`emails/newsletter-template.html`. Contiene già il link per annullare l'iscrizione, obbligatorio.

## Come funziona
- "Create account" chiede nome e consenso newsletter (casella non selezionata di default).
- Dopo il primo accesso confermato, `/api/welcome` crea la riga in `members` (piano explorer),
  invia una sola volta l'email di benvenuto e, solo con il consenso, aggiunge l'indirizzo ai contatti Resend.
  Chi si era già cancellato non viene reiscritto.
- Template pronti in `api/_lib/emailTemplates.js`: benvenuto (attivo) e conferma abbonamento
  (`membershipEmail`, da collegare al webhook Stripe in un secondo momento).
