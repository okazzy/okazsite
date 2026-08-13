'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function CookieBanner() {
  const t = useTranslations();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Here you would typically enable tracking scripts (e.g. Google Analytics)
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    // Here you would typically disable tracking scripts
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        zIndex: 9999,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--color-text)' }}>
          {t('cookieConsentTitle')}
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {t('cookieConsentMessage')}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={declineCookies}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {t('btnDecline')}
        </button>
        <button
          onClick={acceptCookies}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'var(--color-primary)',
            border: 'none',
            color: 'var(--color-background)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {t('btnAccept')}
        </button>
      </div>
    </div>
  );
}
