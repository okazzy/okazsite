'use client';

import { useEffect, useState } from 'react';
import './download.css';

const APPLE_STORE_LINK = "https://apps.apple.com/app/okaz/id6780990007";
const GOOGLE_PLAY_LINK = "https://play.google.com/store/apps/details?id=com.okaz.awakening";

export default function DownloadPage() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      window.location.href = APPLE_STORE_LINK;
      return;
    }

    // Android detection
    if (/android/i.test(userAgent)) {
      window.location.href = GOOGLE_PLAY_LINK;
      return;
    }

    // If it reaches here, it's a desktop or unknown, so show the landing page
    setIsChecking(false);
  }, []);

  if (isChecking) {
    // Show a blank or minimal loading state while we instantly check user agent and redirect
    return (
      <div className="download-page" style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
        {/* Empty to avoid flash before redirect */}
      </div>
    );
  }

  return (
    <div className="download-page">
      <img src="/logo.png" alt="Okaz / عكاظ" className="download-page-logo" />
      
      <h1 className="download-page-greeting">
        Welcome to Okaz
      </h1>
      <h1 className="download-page-greeting arabic">
        أهلاً بك في عكاظ
      </h1>
      
      <p className="download-page-subtitle">
        Choose your platform to download the app / اختر منصتك لتحميل التطبيق
      </p>

      <div className="download-page-buttons">
        <a href={APPLE_STORE_LINK} className="download-page-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 1.44C11 6.44 9.22 5 7 5a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
            <path d="M10 2c1 .5 2 2 2 3.5-1.5.5-3-1.5-3-3.5Z" />
          </svg>
          App Store
        </a>
        
        <a href={GOOGLE_PLAY_LINK} className="download-page-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Google Play
        </a>
      </div>
    </div>
  );
}
