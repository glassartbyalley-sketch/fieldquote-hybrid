# FieldQuote & Contract Hybrid

A browser workspace for small South African contractors. Convert site notes into editable ZAR quotes, produce printable agreements and invoices, record acceptance in a revenue pipeline, and draft EFT or overdue emails.

## Run locally

Use Node 22.12 or later. Install dependencies with `npm ci`, copy `.env.example` to `.env`, and run `npm run dev`. The manual quote workflow runs without Firebase configuration.

1. Create a Firebase project and register a Web app. Enable Firebase AI Logic with the Gemini Developer API backend. Copy the web config values into the matching environment fields.
2. For local App Check, register a debug token for this Web app in Firebase Console, then set `VITE_APPCHECK_DEBUG_TOKEN` to that token. Alternatively set it to `true`, start an online cloud action, read the generated token in Chrome DevTools, register it in Firebase Console, and refresh. Restart Vite when editing the environment. Keep debug tokens private and revoke them when testing ends. The app only reads the debug token in Vite development mode. Remove the variable before building for distribution.
3. For a deployed or preview build, configure App Check with reCAPTCHA v3, allow the deployment hostname, and set `VITE_RECAPTCHA_V3_SITE_KEY` before building. No reCAPTCHA Enterprise key is required by this implementation.
4. For local inference, use current desktop Google Chrome with the Prompt API for Gemini Nano available. Follow the [Firebase Chrome setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started) for required flags and model download. Run a local action while online first to verify that the model is installed.

## Runtime hybrid architecture

`ai.js` initializes `firebase/app`, `firebase/app-check`, and `firebase/ai`, then calls `getGenerativeModel(...).generateContent(...)` through Firebase AI Logic with `GoogleAIBackend`. Quote extraction and EFT wording use `PREFER_ON_DEVICE`. Reminders with CC recipients use `PREFER_IN_CLOUD`. Simulate Offline / Force On-Device or a browser offline signal selects `ONLY_ON_DEVICE`, which prevents cloud fallback. The badge uses the SDK's response inferenceSource. The cloud model defaults to `gemini-2.5-flash`; new projects should set `VITE_FIREBASE_CLOUD_MODEL=gemini-3.5-flash-lite` if they cannot access 2.5 Flash. Google says new access to 2.5 Flash is restricted and requests will be redirected from December 1, 2026. See the [Gemini deprecation schedule](https://ai.google.dev/gemini-api/docs/deprecations).

No email addresses, payment amounts or banking details are sent in email drafting prompts. The app inserts those fields unchanged after AI writes the paragraph. Site notes may go to the cloud unless you force on-device mode. Drafts and jobs are stored in the current browser. There is no payment collection, email sending or authentication service. Open in Email Client pre-fills a draft. Some clients ignore Reply-To in mailto links, so use the displayed or copied header to verify it before sending. Use the print dialog's Save as PDF destination for downloads.

## Demo checklist

- On Chrome desktop, paste sample notes and extract line items. Check the actual On-Device badge, then review prices in the editable rows.
- Generate a document, use the acceptance button, and check that the pipeline increases by the quote total only once. Amend it inside the original one-hour window and review the new document and notification draft.
- Confirm an EFT using the exact balance from your own records. Try a zero balance and a partial balance. Selecting a job prefills the client information. Enter the remaining balance from your payment records.
- Add CC recipients to an overdue reminder with the force toggle off. Check the badge, copy the draft and inspect all recipient headers. Try the force toggle again on the same workflow.
- Run `npm run build` and `npm run preview` with production App Check configured. Open the preview once online and let the app shell cache install. Preinstall Gemini Nano while online. Then disconnect to test a real offline reload and on-device action. The service worker caches the app shell, not client records or Gemini responses.

Apache License 2.0.


