# FieldQuote & Contract Hybrid

FieldQuote is a web demo for South African contractors. Paste rough site notes and Gemini turns them into editable quote items in rand. Review the amounts, choose payment terms, and generate a printable quotation, contract or invoice.

## Try the demo

[Open the FieldQuote StackBlitz project](https://stackblitz.com/edit/github-2pnpxqqf). Use the project’s **Preview** button. AI extraction needs an internet connection and a configured Firebase project. You can enter line items manually to try the quote and payment workflow without Firebase setup.

1. Enter a fictional client and job address. Try these notes: “One new door at R300, one used blue door for R50, and two chairs for R300 together.” Click **AI Extract Line Items**. Review the rows and check that the subtotal is **R650.00**.
2. Choose a payment split, optionally set a due date, and click **Generate Document**. The demo shows the email the client would receive. Use **View / Download Document** and choose **Save as PDF** in the print dialog.
3. Mark the quote accepted and open **Confirm EFT**. Record a partial payment to see the remaining balance. Under **Saved quotes**, you can reopen saved email previews, prepare a reminder for an overdue balance, or record another payment.

Email previews simulate delivery. FieldQuote has no mail service connected and sends no emails. The browser saves quotes, payment confirmations and reminders locally.

## Run locally

Use Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Before testing AI, register a web app in Firebase and enable **Firebase AI Logic** with the **Gemini Developer API** backend. Copy `.env.example` to `.env` beside `package.json` and fill in the web app configuration from **Firebase → Project settings → General → Your apps**. Restart Vite after changing `.env`. A fresh StackBlitz import needs its own configuration.

For local development with App Check, set `VITE_APPCHECK_DEBUG_TOKEN` privately and register the token in Firebase. For deployment, configure reCAPTCHA v3 for the actual hostname and set `VITE_RECAPTCHA_V3_SITE_KEY` before running `npm run build`. Keep private tokens out of GitHub and public builds. See [Firebase App Check setup](https://firebase.google.com/docs/ai-logic/app-check).

## How AI works

`ai.js` calls Firebase AI Logic through `getAI`, `GoogleAIBackend` and `generateContent`, using **Gemini 3.5 Flash-Lite** in the cloud. The app turns model output into editable rows and calculates totals from those rows. EFT and overdue email previews use templates populated with the entered amounts and recipient details. This version uses cloud inference only and requires internet for AI. The hybrid name is retained from the original prototype.

## Licence

[Apache License 2.0](LICENSE).
