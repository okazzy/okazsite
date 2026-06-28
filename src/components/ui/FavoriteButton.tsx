'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { toggleFavorite, toggleFavoriteVideo } from '@/lib/firebase/firestore';

interface FavoriteButtonProps {
  itemId: string;
  type: 'track' | 'video';
  className?: string;
}

const HeartOutline = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function FavoriteButton({ itemId, type, className = '' }: FavoriteButtonProps) {
  const { firebaseUser, userData, refreshUserData, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isFav = type === 'track'
    ? userData?.favorites?.includes(itemId)
    : userData?.favoriteVideos?.includes(itemId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If no user is logged in (including anonymous), we can't favorite
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (type === 'track') {
        await toggleFavorite(firebaseUser.uid, itemId);
      } else {
        await toggleFavoriteVideo(firebaseUser.uid, itemId);
      }
      await refreshUserData();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`favorite-btn ${isFav ? 'active' : ''} ${className}`}
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFav ? <HeartFilled /> : <HeartOutline />}
    </button>
  );
}
