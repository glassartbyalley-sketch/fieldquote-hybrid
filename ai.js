import { initializeApp } from 'firebase/app';
import { initializeAppCheck, CustomProvider, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAI, GoogleAIBackend, getGenerativeModel, InferenceMode, InferenceSource } from 'firebase/ai';

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

export async function generate(prompt, { localOnly, complex }) {
  const mode = localOnly || !navigator.onLine ? InferenceMode.ONLY_ON_DEVICE
    : complex ? InferenceMode.PREFER_IN_CLOUD : InferenceMode.PREFER_ON_DEVICE;
  const model = getGenerativeModel(service(), {
    model: import.meta.env.VITE_FIREBASE_CLOUD_MODEL || 'gemini-3.5-flash-lite', mode,
  });
  if (typeof model.initializeDeviceModel === 'function') {
    const ready = model.initializeDeviceModel();
    if (mode === InferenceMode.ONLY_ON_DEVICE) await ready;
    else void Promise.resolve(ready).catch(() => {});
  }
  const { response } = await model.generateContent(prompt);
  const source = response.inferenceSource;
  const label = source === InferenceSource.ON_DEVICE ? 'On-Device (Local Chrome AI)'
    : source === InferenceSource.IN_CLOUD ? 'Cloud Fallback (Firebase AI Logic)' : 'Inference source unavailable';
  return { text: response.text().trim(), label };
}


