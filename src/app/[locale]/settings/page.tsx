'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import {
  signOut as firebaseSignOut,
  deleteAccount as firebaseDeleteAccount,
  updateDisplayName,
} from '@/lib/firebase/auth';
import './settings.css';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isGuest, userData, firebaseUser, refreshUserData } = useAuth();
  const locale = useLocale();

  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(userData?.displayName || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      router.replace('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await firebaseDeleteAccount();
      router.replace('/');
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await updateDisplayName(newName.trim());
      await refreshUserData();
      setShowEditName(false);
    } catch (err) {
      console.error('Update name error:', err);
    }
  };

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1 className="settings-title">{t('navSettings')}</h1>
      </header>

      {/* Profile Section */}
      <section className="settings-section">
        <div className="settings-profile">
          <div className="settings-avatar">
            {userData?.displayName?.[0]?.toUpperCase() || (locale === 'ar' ? 'ع' : 'O')}
          </div>
          <div className="settings-profile-info">
            {isAuthenticated ? (
              <>
                <h2 className="settings-profile-name">{userData?.displayName || t('defaultDisplayName')}</h2>
                <p className="settings-profile-email">{firebaseUser?.email}</p>
              </>
            ) : (
              <>
                <p className="settings-profile-guest">{t('msgUsingAsGuest')}</p>
                <Link href="/auth/login" className="btn-primary settings-login-btn">
                  {t('btnLogInOrRegister')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Account Settings */}
      {isAuthenticated && (
        <section className="settings-section">
          <h3 className="settings-section-title">
            {locale === 'ar' ? 'الحساب' : 'Account'}
          </h3>
          <div className="settings-list">
            <button className="settings-item" onClick={() => { setNewName(userData?.displayName || ''); setShowEditName(true); }}>
              <span className="settings-item-label">{t('titleEditDisplayName')}</span>
              <span className="settings-item-value">{userData?.displayName || t('defaultDisplayName')}</span>
              <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </section>
      )}

      {/* Preferences */}
      <section className="settings-section">
        <h3 className="settings-section-title">
          {locale === 'ar' ? 'التفضيلات' : 'Preferences'}
        </h3>
        <div className="settings-list">
          <button className="settings-item" onClick={toggleLocale}>
            <span className="settings-item-label">{t('titleLanguage')}</span>
            <span className="settings-item-value">{locale === 'ar' ? t('langArabic') : t('langEnglish')}</span>
            <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="settings-item settings-item-info">
            <span className="settings-item-label">{t('titlePresentReminders')}</span>
            <span className="settings-item-badge">{t('remindersAppOnly')}</span>
          </div>
          <div className="settings-item settings-item-info">
            <span className="settings-item-label">{t('titleSleepTimer')}</span>
            <span className="settings-item-badge">
              {locale === 'ar' ? 'حصرياً على التطبيق' : 'App Only'}
            </span>
          </div>
        </div>
      </section>

      {/* App Download CTA */}
      <section className="settings-section settings-download">
        <div className="settings-download-card glass-card">
          <h3 className="settings-download-title">{t('downloadAppTitle')}</h3>
          <p className="settings-download-desc">{t('downloadAppDesc')}</p>
          <a href="https://apps.apple.com/app/okaz/id6780990007" target="_blank" rel="noopener noreferrer" className="btn-primary">
            {t('downloadApp')}
          </a>
        </div>
      </section>

      {/* About */}
      <section className="settings-section">
        <h3 className="settings-section-title">
          {locale === 'ar' ? 'عن التطبيق' : 'About'}
        </h3>
        <div className="settings-list">
          <Link href="/contact" className="settings-item">
            <span className="settings-item-label">{t('titleLetsConnect')}</span>
            <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
          <Link href="/qa" className="settings-item">
            <span className="settings-item-label">{t('titleQA')}</span>
            <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
          <Link href="/privacy" className="settings-item">
            <span className="settings-item-label">{t('titlePrivacyPolicy')}</span>
            <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
          <Link href="/terms" className="settings-item">
            <span className="settings-item-label">{t('titleTermsOfService')}</span>
            <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      {isAuthenticated && (
        <section className="settings-section settings-danger">
          <div className="settings-list">
            <button className="settings-item settings-item-danger" onClick={handleSignOut}>
              <span className="settings-item-label">{t('btnLogout')}</span>
            </button>
            <button className="settings-item settings-item-danger" onClick={() => setShowDeleteConfirm(true)}>
              <span className="settings-item-label">{t('btnDeleteAccount')}</span>
            </button>
          </div>
        </section>
      )}

      {/* Edit Name Modal */}
      {showEditName && (
        <div className="settings-modal-overlay" onClick={() => setShowEditName(false)}>
          <div className="settings-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="settings-modal-title">{t('titleEditDisplayName')}</h2>
            <form onSubmit={handleUpdateName}>
              <input
                type="text"
                className="input-field"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('hintEnterNewName')}
                autoFocus
              />
              <div className="settings-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditName(false)}>{t('btnCancel')}</button>
                <button type="submit" className="btn-primary">{t('btnSave')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="settings-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="settings-modal-title settings-modal-title-danger">{t('dialogDeleteAccountTitle')}</h2>
            <p className="settings-modal-desc">{t('dialogDeleteAccountContent')}</p>
            <div className="settings-modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>{t('btnCancel')}</button>
              <button className="btn-danger" onClick={handleDeleteAccount}>{t('btnDelete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
