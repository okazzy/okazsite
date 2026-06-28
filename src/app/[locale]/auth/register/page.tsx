'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { registerWithEmail } from '@/lib/firebase/auth';
import '../login/auth.css';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    router.replace('/');
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError(t('errNameRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('errPasswordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName);
      router.replace('/');
    } catch {
      setError(t('errRegistrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('titleCreateAccount')}</h1>
          <p className="auth-subtitle">{t('msgJoinFrequency')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label htmlFor="reg-name">{t('labelDisplayName')}</label>
            <input
              id="reg-name"
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-email">{t('labelEmailAddress')}</label>
            <input
              id="reg-email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-password">{t('labelPassword')}</label>
            <input
              id="reg-password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? '...' : t('btnRegister')}
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/auth/login" className="auth-link">
            {t('msgLogInPrompt')}
          </Link>
        </div>
      </div>
    </div>
  );
}
