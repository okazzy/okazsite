'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { getVideoCategories, getVideoSubcategories } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { CategoryModel, SubcategoryModel } from '@/lib/models';
import '../watch.css';

export default function WatchCategoryPage() {
  const t = useTranslations();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [categoryTitle, setCategoryTitle] = useState('');
  const [subcategories, setSubcategories] = useState<SubcategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !categoryId) return;

    Promise.all([
      getVideoCategories().catch(() => [] as CategoryModel[]),
      getVideoSubcategories(categoryId).catch(() => [] as SubcategoryModel[]),
    ])
      .then(([categories, subs]) => {
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) setCategoryTitle(getLocalizedText(cat.title, locale));
        setSubcategories(subs);
      })
      .catch((err) => console.error('Error loading watch subcategories:', err))
      .finally(() => setLoading(false));
  }, [authLoading, categoryId, locale]);

  return (
    <div className="watch-page">
      <nav className="watch-breadcrumb">
        <Link href="/watch">{t('watchTitle')}</Link>
        <span className="watch-breadcrumb__separator">›</span>
        <span className="watch-breadcrumb__current">{categoryTitle}</span>
      </nav>

      <header className="watch-header">
        <h1 className="watch-header__title">{categoryTitle}</h1>
      </header>

      {loading ? (
        <div className="watch-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : subcategories.length === 0 ? (
        <div className="watch-empty">
          <div className="watch-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
          <p className="watch-empty__text">{t('errNoVideoSubcategories')}</p>
        </div>
      ) : (
        <div className="watch-grid">
          {subcategories.map((sub) => (
            <div key={sub.id} className="watch-grid-card">
              <Link href={`/watch/${categoryId}/${sub.id}`}>
                <div className="watch-grid-card__image-wrapper">
                  {sub.imageUrl ? (
                    <img
                      className="watch-grid-card__image"
                      src={sub.imageUrl}
                      alt={getLocalizedText(sub.title, locale)}
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
                      {getLocalizedText(sub.title, locale)}
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
