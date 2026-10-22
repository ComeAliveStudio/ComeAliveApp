# Prezzi e Stripe: configurazione

## Piani
- **Founding Member:** 29 euro al mese, abbonamento, disdicibile in qualsiasi momento.
- **Master Planner:** 290 euro in un unico pagamento, valido 3 mesi (circa 97 euro al mese),
  con 3 sessioni da 45 minuti, una al mese. Alla scadenza si rinnova acquistando di nuovo (pulsante "Renew" in Billing).

## Su Stripe (Dashboard > Payment Links > New), modalità reale
1. Prodotto **Founding Member**: prezzo 29,00 EUR, ricorrente, ogni mese.
2. Prodotto **Master Planner (3 months)**: prezzo 290,00 EUR, pagamento singolo.
3. In entrambi: prezzi IVA inclusa (come scritto nei Termini) e, in "After payment", reindirizzamento a
   `https://app.comealive.vision/?payment=success`.
4. Copia i due link e inseriscili in `src/App.jsx`, oggetto `PAYMENT_LINKS` (chiavi `founding` e `master`),
   al posto dei link `test_`. Dillo a Claude e lo fa lui.

## Webhook (Stripe > Developers > Webhooks)
Endpoint `https://app.comealive.vision/api/stripe-webhook`, eventi: `checkout.session.completed`,
`customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

## Come il sito riconosce il piano
Dall'importo pagato: 2900 centesimi = Founding Member, 29000 = Master Planner.
Il Master Planner scade da solo dopo 3 mesi (data salvata in `plan_expires_at`).
Se cambi un prezzo, va aggiornato anche `getPlanFromAmount` in `api/stripe-webhook.js`.
