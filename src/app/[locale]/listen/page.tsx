'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { CategoryModel } from '@/lib/models';
import './listen.css';

export default function ListenPage() {
  const t = useTranslations();
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Error loading categories:', err))
      .finally(() => setLoading(false));
  }, [authLoading]);

  return (
    <div className="listen-page">
      <header className="listen-page-header">
        <h1 className="listen-page-title">{t('navListen')}</h1>
        <p className="listen-page-subtitle">
          {locale === 'ar'
            ? 'اكتشف مقاطع صوتية للتأمل والاسترخاء'
            : 'Discover audio for meditation and relaxation'}
        </p>
      </header>

      {loading ? (
        <div className="listen-categories-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="listen-empty-state">
          <div className="listen-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <p className="listen-empty-text">{t('errNoCategories')}</p>
        </div>
      ) : (
        <div className="listen-categories-grid">
          {categories.map((cat, i) => (
            <Link
              href={`/listen/${cat.id}`}
              key={cat.id}
              className={`listen-category-card listen-stagger-${Math.min(i + 1, 12)}`}
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={getLocalizedText(cat.title, locale)}
                  className="listen-category-card-image"
                  loading="lazy"
                />
              ) : (
                <div className="listen-category-card-placeholder">
                  <div className="listen-category-card-placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="listen-category-card-overlay" />
              <div className="listen-category-card-content">
                <h2 className="listen-category-card-title">
                  {getLocalizedText(cat.title, locale)}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
