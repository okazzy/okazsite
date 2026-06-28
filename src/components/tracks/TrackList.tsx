'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAudio } from '@/contexts/AudioContext';
import { getLocalizedText } from '@/lib/models';
import type { TrackModel } from '@/lib/models';
import FavoriteButton from '@/components/ui/FavoriteButton';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

interface TrackListProps {
  tracks: TrackModel[];
  locale: string;
  categoryId: string;
  subcategoryId: string;
}

export default function TrackList({ tracks, locale, categoryId, subcategoryId }: TrackListProps) {
  const t = useTranslations();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  const handleTrackClick = (track: TrackModel) => {
    if (currentTrack?.trackId === track.trackId) {
      togglePlay();
    } else {
      playTrack(track, tracks, locale);
    }
  };

  const isCurrentTrack = (track: TrackModel) =>
    currentTrack?.trackId === track.trackId;

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="listen-breadcrumbs">
        <Link href="/listen" className="listen-breadcrumb-link">
          {t('navListen')}
        </Link>
        <span className="listen-breadcrumb-separator">/</span>
        <Link href={`/listen/${categoryId}`} className="listen-breadcrumb-link">
          {locale === 'ar' ? 'التصنيفات الفرعية' : 'Subcategories'}
        </Link>
        <span className="listen-breadcrumb-separator">/</span>
        <span className="listen-breadcrumb-current">
          {locale === 'ar' ? 'المقاطع' : 'Tracks'}
        </span>
      </nav>

      {tracks.length === 0 ? (
        <div className="listen-empty-state">
          <div className="listen-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className="listen-empty-text">{t('errNoTracksAvailable')}</p>
        </div>
      ) : (
        <div className="listen-track-list">
          {tracks.map((track, i) => {
            const isCurrent = isCurrentTrack(track);
            const title = getLocalizedText(track.title, locale);
            const desc = getLocalizedText(track.description, locale);
            const imgUrl = getLocalizedText(track.imageUrl, locale);

            return (
              <div
                key={track.trackId}
                className={`listen-track-item listen-stagger-${Math.min(i + 1, 12)} ${isCurrent ? 'is-playing' : ''}`}
                onClick={() => handleTrackClick(track)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrackClick(track);
                  }
                }}
              >
                {/* Track image */}
                <div className="listen-track-image-wrapper">
                  {imgUrl ? (
                    <img src={imgUrl} alt={title} className="listen-track-image" loading="lazy" />
                  ) : (
                    <div className="listen-track-image" style={{ background: 'var(--color-surface-elevated)' }} />
                  )}
                </div>

                {/* Track info */}
                <div className="listen-track-info">
                  <h3 className="listen-track-title">{title}</h3>
                  {desc && (
                    <p className="listen-track-description">{desc}</p>
                  )}
                  <div className="listen-track-meta">
                    {track.isPremium && (
                      <span className="listen-track-premium-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Play/Pause button */}
                <button
                  className={`listen-track-play-btn ${isCurrent && isPlaying ? 'pause' : 'play'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackClick(track);
                  }}
                  aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
                >
                  {isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
