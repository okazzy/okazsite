'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import {
  getVideoCategories,
  getVideoSubcategories,
  getVideos,
} from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { CategoryModel, SubcategoryModel, VideoModel } from '@/lib/models';
import VideoList from '@/components/videos/VideoList';
import '../../watch.css';

export default function WatchVideosPage() {
  const t = useTranslations();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [categoryTitle, setCategoryTitle] = useState('');
  const [subcategoryTitle, setSubcategoryTitle] = useState('');
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !categoryId || !subcategoryId) return;

    Promise.all([
      getVideoCategories().catch(() => [] as CategoryModel[]),
      getVideoSubcategories(categoryId).catch(() => [] as SubcategoryModel[]),
      getVideos(categoryId, subcategoryId).catch(() => [] as VideoModel[]),
    ])
      .then(([cats, subs, vids]) => {
        const cat = cats.find((c) => c.id === categoryId);
        if (cat) setCategoryTitle(getLocalizedText(cat.title, locale));
        const sub = subs.find((s) => s.id === subcategoryId);
        if (sub) setSubcategoryTitle(getLocalizedText(sub.title, locale));
        setVideos(vids);
      })
      .catch((err) => console.error('Error loading videos:', err))
      .finally(() => setLoading(false));
  }, [authLoading, categoryId, subcategoryId, locale]);

  return (
    <div className="watch-page">
      <nav className="watch-breadcrumb">
        <Link href="/watch">{t('watchTitle')}</Link>
        <span className="watch-breadcrumb__separator">›</span>
        <Link href={`/watch/${categoryId}`}>{categoryTitle}</Link>
        <span className="watch-breadcrumb__separator">›</span>
        <span className="watch-breadcrumb__current">{subcategoryTitle}</span>
      </nav>

      <header className="watch-header">
        <h1 className="watch-header__title">{subcategoryTitle}</h1>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="watch-empty">
          <div className="watch-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <p className="watch-empty__text">{t('errNoVideosAvailable')}</p>
        </div>
      ) : (
        <VideoList videos={videos} locale={locale} />
      )}
    </div>
  );
}
