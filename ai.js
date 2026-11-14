import { initializeApp } from 'firebase/app';
import { initializeAppCheck, CustomProvider, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAI, GoogleAIBackend, getGenerativeModel } from 'firebase/ai';

let ai;
function service() {
  if (ai) return ai;
  const env = import.meta.env;
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID, storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: env.VITE_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error('Add your Firebase web configuration to .env and restart Vite.');
  }
  const app = initializeApp(config);
  const debug = env.DEV && env.VITE_APPCHECK_DEBUG_TOKEN;
  const siteKey = env.VITE_RECAPTCHA_V3_SITE_KEY;
  if (debug) self.FIREBASE_APPCHECK_DEBUG_TOKEN = debug === 'true' ? true : debug;
  const provider = debug || !siteKey
    ? new CustomProvider({ getToken: async () => {
        throw new Error('Configure a reCAPTCHA v3 site key or a registered local App Check debug token.');
      } })
    : new ReCaptchaV3Provider(siteKey);
  initializeAppCheck(app, { provider });
  ai = getAI(app, { backend: new GoogleAIBackend() });
  return ai;
}

export async function generate(prompt) {
  if (!navigator.onLine) throw new Error('Connect to the internet to use FieldQuote AI, then try again.');
  const model = getGenerativeModel(service(), {
    model: 'gemini-3.5-flash-lite',
  });
  const { response } = await model.generateContent(prompt);
  return { text: response.text().trim(), label: 'Cloud AI (Firebase AI Logic)' };
}
