'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import {
  getDailyQuote,
  getCategories,
  getRandomFeaturedVideos,
  getCategoryHighlightTracks,
} from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { CategoryModel, TrackModel, VideoModel, QuoteModel } from '@/lib/models';
import FavoriteButton from '@/components/ui/FavoriteButton';
import './page.css';

interface CategoryHighlight {
  category: CategoryModel;
  tracks: TrackModel[];
}

export default function HomePage() {
  const t = useTranslations();
  const { loading: authLoading } = useAuth();
  const locale = useLocale();

  const [quote, setQuote] = useState<QuoteModel | null>(null);
  const [featuredVideos, setFeaturedVideos] = useState<VideoModel[]>([]);
  const [categoryHighlights, setCategoryHighlights] = useState<CategoryHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoModel | null>(null);
  
  const { playTrack } = useAudio();

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
    if (authLoading) return; // Wait for auth to initialize (anonymous sign-in)

    const fetchData = async () => {
      try {
        const [q, cats, vids] = await Promise.all([
          getDailyQuote(locale).catch(() => null),
          getCategories().catch(() => []),
          getRandomFeaturedVideos(4).catch(() => []),
        ]);

        setQuote(q);
        setFeaturedVideos(vids);

        // Fetch highlight tracks for first 3 categories
        const highlights: CategoryHighlight[] = [];
        for (const cat of cats.slice(0, 3)) {
          const tracks = await getCategoryHighlightTracks(cat.id, 4).catch(() => []);
          highlights.push({ category: cat, tracks });
        }
        setCategoryHighlights(highlights);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, locale]);

  return (
    <div className="homepage">
      {/* ===== Hero Section ===== */}
      <section className="hero">
        <div className="hero-particles" aria-hidden="true">
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
        </div>
        <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt={t('appName')} className="hero-logo home-stagger-1" />
          <h1 className="hero-app-name home-stagger-1" style={{ marginTop: 0 }}>{t('appName')}</h1>
          <p className="hero-title home-stagger-2">{t('heroTitle')}</p>
          <p className="hero-subtitle home-stagger-3">{t('heroSubtitle')}</p>
          <div className="hero-cta home-stagger-4">
            <Link href="/listen" className="btn-primary">
              {t('navListen')}
            </Link>
          </div>
          <div className="hero-socials home-stagger-5" style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', justifyContent: 'center' }}>
            <a href="https://www.tiktok.com/@okaz.souq" target="_blank" rel="noopener noreferrer" className="hero-social-link" aria-label="TikTok">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-1.76.19-3.58 1.14-5.11 1.18-1.79 3.09-2.91 5.13-3.23.23-.04.46-.07.69-.1v4.06c-1.34.11-2.61.9-3.24 2.11-.63 1.25-.66 2.81.08 4.08.76 1.25 2.14 2.03 3.59 2.04 1.83.05 3.52-1.14 4.09-2.86.31-.96.34-2.01.33-3.01V.02h-1.17z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@okaz_souq" target="_blank" rel="noopener noreferrer" className="hero-social-link" aria-label="YouTube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://instagram.com/okaz.souq" target="_blank" rel="noopener noreferrer" className="hero-social-link" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://chat.whatsapp.com/F3Dy5SmU7Eo4ZuKjfj1MkU" target="_blank" rel="noopener noreferrer" className="hero-social-link" aria-label="WhatsApp">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.29 5.29 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </a>
            <a href="https://apps.apple.com/app/okaz/id6780990007" target="_blank" rel="noopener noreferrer" className="hero-social-link" aria-label="App Store">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.326 12.181c0-2.827 2.302-4.186 2.411-4.25-1.31-1.916-3.35-2.18-4.077-2.22-1.745-.176-3.407.973-4.298.973-.892 0-2.261-.952-3.705-.925-1.896.026-3.642 1.101-4.619 2.796-1.979 3.432-.505 8.513 1.423 11.3 .942 1.356 2.062 2.891 3.535 2.836 1.419-.055 1.954-.916 3.67-.916 1.716 0 2.225.916 3.697.889 1.502-.027 2.478-1.4 3.415-2.766 1.085-1.585 1.533-3.125 1.554-3.208-.035-.015-2.906-1.116-2.906-4.509zm-3.08-6.195c.783-.949 1.309-2.267 1.164-3.586-1.135.046-2.525.756-3.328 1.705-.717.842-1.343 2.185-1.178 3.473 1.272.099 2.56-.633 3.342-1.592z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="home-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-xl) 0' }}>
          <div className="shimmer" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
          <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        </div>
      )}

      {/* ===== Daily Quote ===== */}
      {!loading && quote && (
        <section className="home-section quote-section home-stagger-5" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{t('quoteOfTheDay')}</h2>
          <div className="quote-card">
            <div className="quote-decoration" aria-hidden="true">
              <span className="quote-mark">&ldquo;</span>
            </div>
            <blockquote className="quote-text">{quote.quoteText}</blockquote>
            <cite className="quote-author">{quote.authorName}</cite>
          </div>
        </section>
      )}

      {/* ===== Featured Videos ===== */}
      {!loading && featuredVideos.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="section-title">{t('featuredPractices')}</h2>
            <Link href="/watch" className="see-all-link">
              {locale === 'ar' ? 'عرض الكل' : 'See All'}
            </Link>
          </div>
          <div className="home-section-divider" />
          <div className="videos-carousel">
            {featuredVideos.map((video, i) => (
              <div
                key={`vid-${i}`}
                className={`video-card card-stagger-${Math.min(i + 1, 4)}`}
                onClick={() => setSelectedVideo(video)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
              >
                {getLocalizedText(video.imageUrl, locale) ? (
                  <img
                    src={getLocalizedText(video.imageUrl, locale)}
                    alt={getLocalizedText(video.title, locale)}
                    className="video-card-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="video-card-image" style={{ background: 'var(--color-surface-elevated)' }} />
                )}
                <div className="video-card-overlay" />
                <div className="video-card-play">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h3 className="video-card-title">
                  {getLocalizedText(video.title, locale)}
                </h3>
                {(video.isPremium || video.isPractice) && (
                  <div className="video-card-badges">
                    {video.isPractice && (
                      <span className="badge-practice">
                        {locale === 'ar' ? 'تمرين' : 'Practice'}
                      </span>
                    )}
                    {video.isPremium && (
                      <span className="badge-premium">Premium</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Category Highlights ===== */}
      {!loading && categoryHighlights.map(
        ({ category, tracks }) =>
          tracks.length > 0 && (
            <section key={category.id} className="home-section category-section">
              <div className="home-section-header">
                <h2 className="section-title">
                  {getLocalizedText(category.title, locale)}
                </h2>
                <Link href="/listen" className="see-all-link">
                  {locale === 'ar' ? 'عرض الكل' : 'See All'}
                </Link>
              </div>
              <div className="home-section-divider" />
              <div className="tracks-carousel">
                {tracks.map((track, i) => (
                  <div
                    key={`${category.id}-${track.trackId}-${i}`}
                    className={`track-card card-stagger-${Math.min(i + 1, 4)}`}
                    onClick={() => playTrack(track, tracks, locale)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="track-card-image-wrapper">
                      {getLocalizedText(track.imageUrl, locale) ? (
                        <img
                          src={getLocalizedText(track.imageUrl, locale)}
                          alt={getLocalizedText(track.title, locale)}
                          className="track-card-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="track-card-image" style={{ background: 'var(--color-surface-elevated)' }} />
                      )}
                      <div className="track-card-image-overlay" />
                      <div className="track-card-play">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    <div className="track-card-info">
                      <h3 className="track-card-title">
                        {getLocalizedText(track.title, locale)}
                      </h3>
                      <p className="track-card-desc">
                        {getLocalizedText(track.description, locale)}
                      </p>
                    </div>
                    {track.isPremium && (
                      <span className="track-card-premium">Premium</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
      )}

      {/* ===== Download App CTA ===== */}
      <section className="home-section download-cta">
        <div className="download-cta-content">
          <div className="download-cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h2 className="download-cta-title">{t('downloadAppTitle')}</h2>
          <p className="download-cta-desc">{t('downloadAppDesc')}</p>
          <a
            href="https://apps.apple.com/app/okaz/id6780990007"
            target="_blank"
            rel="noopener noreferrer"
            className="download-cta-link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('downloadApp')}
          </a>
        </div>
      </section>

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
