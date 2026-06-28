import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './config';

let appCheckInitialized = false;

export function initAppCheck() {
  if (typeof window === 'undefined' || appCheckInitialized) return;
  
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  
  if (!siteKey) {
    console.warn('App Check: reCAPTCHA site key not configured. Skipping App Check initialization.');
    return;
  }

  try {
    // Enable debug token in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error - Firebase App Check debug token
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    
    appCheckInitialized = true;
  } catch (error) {
    // App Check may already be initialized
    console.warn('App Check initialization skipped:', error);
  }
}
