'use client';
import { useLocale } from 'next-intl';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTracks } from '@/lib/firebase/firestore';
import type { TrackModel } from '@/lib/models';
import TrackList from '@/components/tracks/TrackList';
import '../../listen.css';

export default function TracksPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [tracks, setTracks] = useState<TrackModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !categoryId || !subcategoryId) return;

    getTracks(categoryId, subcategoryId)
      .then(setTracks)
      .catch((err) => console.error('Error loading tracks:', err))
      .finally(() => setLoading(false));
  }, [authLoading, categoryId, subcategoryId]);

  if (loading) {
    return (
      <div className="listen-page">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer" style={{ height: 64, borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="listen-page">
      <TrackList
        tracks={tracks}
        locale={locale}
        categoryId={categoryId}
        subcategoryId={subcategoryId}
      />
    </div>
  );
}
