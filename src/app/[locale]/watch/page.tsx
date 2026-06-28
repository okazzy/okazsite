'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { getVideoCategories } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { CategoryModel } from '@/lib/models';
import './watch.css';

export default function WatchPage() {
  const t = useTranslations();
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    getVideoCategories()
      .then(setCategories)
      .catch((err) => console.error('Error loading video categories:', err))
      .finally(() => setLoading(false));
  }, [authLoading]);

  return (
    <div className="watch-page">
      <header className="watch-header">
        <h1 className="watch-header__title">{t('watchTitle')}</h1>
        <p className="watch-header__subtitle">{t('watchSubtitle')}</p>
      </header>

      {loading ? (
        <div className="watch-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="watch-empty">
          <div className="watch-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </div>
          <p className="watch-empty__text">{t('errNoVideoCategories')}</p>
        </div>
      ) : (
        <div className="watch-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="watch-grid-card">
              <Link href={`/watch/${cat.id}`}>
                <div className="watch-grid-card__image-wrapper">
                  {cat.imageUrl ? (
                    <img
                      className="watch-grid-card__image"
                      src={cat.imageUrl}
                      alt={getLocalizedText(cat.title, locale)}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="watch-grid-card__image"
                      style={{ background: 'var(--color-surface-elevated)' }}
                    />
                  )}
                  <div className="watch-grid-card__overlay">
                    <h2 className="watch-grid-card__title">
                      {getLocalizedText(cat.title, locale)}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
