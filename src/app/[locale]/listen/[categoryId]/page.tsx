'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSubcategories } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { SubcategoryModel } from '@/lib/models';
import '../listen.css';

export default function SubcategoriesPage() {
  const t = useTranslations();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [subcategories, setSubcategories] = useState<SubcategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !categoryId) return;

    getSubcategories(categoryId)
      .then(setSubcategories)
      .catch((err) => console.error('Error loading subcategories:', err))
      .finally(() => setLoading(false));
  }, [authLoading, categoryId]);

  return (
    <div className="listen-page">
      <nav className="listen-breadcrumbs">
        <Link href="/listen" className="listen-breadcrumb-link">
          {t('navListen')}
        </Link>
        <span className="listen-breadcrumb-separator">/</span>
        <span className="listen-breadcrumb-current">
          {locale === 'ar' ? 'التصنيفات الفرعية' : 'Subcategories'}
        </span>
      </nav>

      <header className="listen-page-header">
        <h1 className="listen-page-title">
          {locale === 'ar' ? 'التصنيفات الفرعية' : 'Subcategories'}
        </h1>
      </header>

      {loading ? (
        <div className="listen-categories-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : subcategories.length === 0 ? (
        <div className="listen-empty-state">
          <div className="listen-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <p className="listen-empty-text">{t('errNoSubcategories')}</p>
        </div>
      ) : (
        <div className="listen-categories-grid">
          {subcategories.map((sub, i) => (
            <Link
              href={`/listen/${categoryId}/${sub.id}`}
              key={sub.id}
              className={`listen-subcategory-card listen-stagger-${Math.min(i + 1, 12)}`}
            >
              {sub.imageUrl ? (
                <img
                  src={sub.imageUrl}
                  alt={getLocalizedText(sub.title, locale)}
                  className="listen-subcategory-card-image"
                  loading="lazy"
                />
              ) : (
                <div className="listen-subcategory-card-placeholder">
                  <div className="listen-subcategory-card-placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="listen-subcategory-card-overlay" />
              <div className="listen-subcategory-card-content">
                <h2 className="listen-subcategory-card-title">
                  {getLocalizedText(sub.title, locale)}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
