'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { Link } from '@/i18n/routing';
import { getFavoriteTracks, getFavoriteVideos } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { TrackModel, VideoModel } from '@/lib/models';
import FavoriteButton from '@/components/ui/FavoriteButton';
import './favorites.css';

type TabType = 'audio' | 'video';

export default function FavoritesPage() {
  const t = useTranslations();
  const { isAuthenticated, isGuest, userData } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const [activeTab, setActiveTab] = useState<TabType>('audio');
  const [tracks, setTracks] = useState<TrackModel[]>([]);
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoModel | null>(null);
  const locale = useLocale();

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedVideo) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedVideo(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!userData) {
        setLoading(false);
        return;
      }
      try {
        const [favTracks, favVideos] = await Promise.all([
          userData.favorites?.length ? getFavoriteTracks(userData.favorites) : Promise.resolve([]),
          userData.favoriteVideos?.length ? getFavoriteVideos(userData.favoriteVideos) : Promise.resolve([]),
        ]);
        setTracks(favTracks);
        setVideos(favVideos);
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [userData]);

  const handleTrackClick = (track: TrackModel) => {
    if (currentTrack?.trackId === track.trackId) {
      togglePlay();
    } else {
      playTrack(track, tracks, locale);
    }
  };

  // Guest/unauthenticated view
  if (isGuest || !isAuthenticated) {
    return (
      <div className="favorites-page">
        <div className="favorites-guest">
          <div className="favorites-guest-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className="favorites-guest-text">{t('msgLoginForFavourites')}</p>
          <Link href="/auth/login" className="btn-primary">
            {t('btnLogInOrRegister')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1 className="favorites-title">{t('navFavourites')}</h1>
      </header>

      {/* Tabs */}
      <div className="favorites-tabs">
        <button
          className={`favorites-tab ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          {t('navListen')} ({tracks.length})
        </button>
        <button
          className={`favorites-tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          {t('navWatch')} ({videos.length})
        </button>
      </div>

      {loading ? (
        <div className="favorites-loading">
          <div className="shimmer" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
        </div>
      ) : (
        <>
          {/* Audio Favorites */}
          {activeTab === 'audio' && (
            tracks.length === 0 ? (
              <div className="favorites-empty">
                <p>{t('msgNoFavouritesYet')}</p>
              </div>
            ) : (
              <div className="favorites-list">
                {tracks.map((track) => {
                  const isCurrent = currentTrack?.trackId === track.trackId;
                  return (
                    <div
                      key={track.trackId}
                      className={`favorites-item ${isCurrent ? 'is-playing' : ''}`}
                      onClick={() => handleTrackClick(track)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="favorites-item-img">
                        {getLocalizedText(track.imageUrl, locale) ? (
                          <img src={getLocalizedText(track.imageUrl, locale)} alt={getLocalizedText(track.title, locale)} loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-elevated)' }} />
                        )}
                      </div>
                      <div className="favorites-item-info">
                        <h3 className="favorites-item-title">{getLocalizedText(track.title, locale)}</h3>
                      </div>
                      <button className={`favorites-play-btn ${isCurrent && isPlaying ? 'pause' : ''}`}>
                        {isCurrent && isPlaying ? (
                          <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Video Favorites */}
          {activeTab === 'video' && (
            videos.length === 0 ? (
              <div className="favorites-empty">
                <p>{t('msgNoFavouritesYet')}</p>
              </div>
            ) : (
              <div className="favorites-list">
                {videos.map((video) => (
                  <div 
                    key={video.videoId} 
                    className="favorites-item"
                    onClick={() => setSelectedVideo(video)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="favorites-item-img">
                      {getLocalizedText(video.imageUrl, locale) ? (
                        <img src={getLocalizedText(video.imageUrl, locale)} alt={getLocalizedText(video.title, locale)} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-elevated)' }} />
                      )}
                    </div>
                    <div className="favorites-item-info">
                      <h3 className="favorites-item-title">{getLocalizedText(video.title, locale)}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="video-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedVideo(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="video-modal">
            <button
              className="video-modal__close"
              onClick={() => setSelectedVideo(null)}
              aria-label={t('btnClose')}
            >
              ✕
            </button>
            <div className="video-modal__player-wrapper">
              <video
                className="video-modal__player"
                src={getLocalizedText(selectedVideo.videoUrl, locale)}
                controls
                autoPlay
                playsInline
                poster={getLocalizedText(selectedVideo.imageUrl, locale) || undefined}
              />
            </div>
            <div className="video-modal__info">
              {(selectedVideo.isPractice || selectedVideo.isPremium) && (
                <div className="video-modal__badges">
                  {selectedVideo.isPractice && (
                    <span className="video-card__badge video-card__badge--practice">
                      {locale === 'ar' ? 'تمرين' : 'Practice'}
                    </span>
                  )}
                  {selectedVideo.isPremium && (
                    <span className="video-card__badge video-card__badge--premium">Premium</span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <h2 className="video-modal__title">
                  {getLocalizedText(selectedVideo.title, locale)}
                </h2>
                <FavoriteButton itemId={selectedVideo.videoId} type="video" className="inline" />
              </div>
              {getLocalizedText(selectedVideo.description, locale) && (
                <p className="video-modal__description">
                  {getLocalizedText(selectedVideo.description, locale)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
