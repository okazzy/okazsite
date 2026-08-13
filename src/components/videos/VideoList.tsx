'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { VideoModel } from '@/lib/models';
import { getLocalizedText } from '@/lib/models';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { useAuth } from '@/contexts/AuthContext';

interface VideoListProps {
  videos: VideoModel[];
  locale: string;
}

export default function VideoList({ videos, locale }: VideoListProps) {
  const t = useTranslations();
  const { checkGuestLimit } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<VideoModel | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedVideo) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setSelectedVideo(null);
      }
    },
    []
  );

  return (
    <>
      <div className="video-grid">
        {videos.map((video, index) => (
          <div
            key={video.videoId}
            className="video-card"
            style={{ animationDelay: `${index * 0.06}s` }}
            onClick={() => { if (checkGuestLimit()) setSelectedVideo(video); }}
            role="button"
            tabIndex={0}
            aria-label={`${t('btnPlay')} ${getLocalizedText(video.title, locale)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (checkGuestLimit()) setSelectedVideo(video);
              }
            }}
          >
            {/* Badges */}
            {(video.isPractice || video.isPremium) && (
              <div className="video-card__badges">
                {video.isPractice && (
                  <span className="video-card__badge video-card__badge--practice">
                    {t('badgePractice')}
                  </span>
                )}
                {video.isPremium && (
                  <span className="video-card__badge video-card__badge--premium">
                    {t('badgePremium')}
                  </span>
                )}
              </div>
            )}

            {/* Thumbnail */}
            <div className="video-card__thumbnail-wrapper">
              {getLocalizedText(video.imageUrl, locale) ? (
                <img
                  className="video-card__thumbnail"
                  src={getLocalizedText(video.imageUrl, locale)}
                  alt={getLocalizedText(video.title, locale)}
                  loading="lazy"
                />
              ) : (
                <div
                  className="video-card__thumbnail"
                  style={{ background: 'var(--color-surface-elevated)' }}
                />
              )}

              {/* Play Overlay */}
              <div className="video-card__play-overlay">
                <div className="video-card__play-btn">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="video-card__body">
              <h3 className="video-card__title">
                {getLocalizedText(video.title, locale)}
              </h3>
              {getLocalizedText(video.description, locale) && (
                <p className="video-card__description">
                  {getLocalizedText(video.description, locale)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="video-modal-backdrop"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={getLocalizedText(selectedVideo.title, locale)}
        >
          <div className="video-modal">
            {/* Close Button */}
            <button
              className="video-modal__close"
              onClick={() => setSelectedVideo(null)}
              aria-label={t('btnClose')}
            >
              ✕
            </button>

            {/* Video Player */}
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

            {/* Video Info */}
            <div className="video-modal__info">
              {(selectedVideo.isPractice || selectedVideo.isPremium) && (
                <div className="video-modal__badges">
                  {selectedVideo.isPractice && (
                    <span className="video-card__badge video-card__badge--practice">
                      {t('badgePractice')}
                    </span>
                  )}
                  {selectedVideo.isPremium && (
                    <span className="video-card__badge video-card__badge--premium">
                      {t('badgePremium')}
                    </span>
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
    </>
  );
}
