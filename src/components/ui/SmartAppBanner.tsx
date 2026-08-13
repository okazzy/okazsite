'use client';
import { useEffect, useState } from 'react';
import './SmartAppBanner.css';

export default function SmartAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [appLink, setAppLink] = useState('');

  useEffect(() => {
    // Only run on client
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroidDevice = /android/i.test(userAgent);
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    
    // Check if user already dismissed it
    const hasDismissed = localStorage.getItem('okaz_app_banner_dismissed') === 'true';

    // If it's iOS Safari, the native Apple banner (via meta tag) takes over, so we don't show the custom one.
    // However, for iOS Chrome/Firefox, we might want to show it. To keep it simple and avoid conflicts,
    // we'll primarily target Android for this custom banner since iOS has a native one, 
    // but if the user wants it everywhere we can enable it for iOS too if not standalone.
    // Let's enable for Android only for the custom UI to prevent double banners on iOS Safari.
    if (isAndroidDevice && !hasDismissed) {
      setAppLink('https://play.google.com/store/apps/details?id=com.okaz.awakening');
      setIsVisible(true);
      document.body.classList.add('has-app-banner');
    }

    return () => {
      document.body.classList.remove('has-app-banner');
    }
  }, []);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('okaz_app_banner_dismissed', 'true');
    document.body.classList.remove('has-app-banner');
  };

  return (
    <div className="smart-app-banner">
      <button className="smart-app-banner-close" onClick={handleClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      
      <div className="smart-app-banner-content">
        <img src="/logo.png" alt="Okaz" className="smart-app-banner-icon" style={{background: '#fff'}} />
        <div className="smart-app-banner-text">
          <h4 className="smart-app-banner-title">عكاظ | Okaz</h4>
          <p className="smart-app-banner-desc">Get the free app / احصل على التطبيق</p>
        </div>
      </div>
      
      <a href={appLink} target="_blank" rel="noopener noreferrer" className="smart-app-banner-action" onClick={handleClose}>
        Install
      </a>
    </div>
  );
}
