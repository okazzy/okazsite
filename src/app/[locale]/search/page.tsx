'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAudio } from '@/contexts/AudioContext';
import { searchTracks, searchVideos } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { TrackModel, VideoModel } from '@/lib/models';
import './search.css';

type TabType = 'audio' | 'video';

export default function SearchPage() {
  const t = useTranslations();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('audio');
  const [tracks, setTracks] = useState<TrackModel[]>([]);
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // Detect locale from document dir
  const locale = useLocale();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const [trackResults, videoResults] = await Promise.all([
        searchTracks(searchQuery, locale).catch(() => []),
        searchVideos(searchQuery, locale).catch(() => []),
      ]);
      setTracks(trackResults);
      setVideos(videoResults);
    } catch {
      setTracks([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleTrackClick = (track: TrackModel) => {
    if (currentTrack?.trackId === track.trackId) {
      togglePlay();
    } else {
      playTrack(track, tracks, locale);
    }
  };

  const results = activeTab === 'audio' ? tracks : videos;

  return (
    <div className="search-page">
      <header className="search-header">
        <h1 className="search-title">{t('navSearch')}</h1>
      </header>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('hintSearchTracks')}
            autoFocus
          />
        </div>
      </form>

      {/* Tabs */}
      {hasSearched && (
        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            {t('navListen')} ({tracks.length})
          </button>
          <button
            className={`search-tab ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            {t('navWatch')} ({videos.length})
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="search-loading">
          <div className="shimmer" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="search-empty">
          <p>{t('msgNoTracksFound')}</p>
        </div>
      ) : (
        <div className="search-results">
          {activeTab === 'audio' &&
            tracks.map((track) => {
              const isCurrent = currentTrack?.trackId === track.trackId;
              return (
                <div
                  key={track.trackId}
                  className={`search-result-item ${isCurrent ? 'is-playing' : ''}`}
                  onClick={() => handleTrackClick(track)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="search-result-img">
                    {getLocalizedText(track.imageUrl, locale) ? (
                      <img src={getLocalizedText(track.imageUrl, locale)} alt={getLocalizedText(track.title, locale)} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-elevated)' }} />
                    )}
                  </div>
                  <div className="search-result-info">
                    <h3 className="search-result-title">{getLocalizedText(track.title, locale)}</h3>
                    <p className="search-result-desc">{getLocalizedText(track.description, locale)}</p>
                  </div>
                  <button className={`search-play-btn ${isCurrent && isPlaying ? 'pause' : ''}`}>
                    {isCurrent && isPlaying ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                </div>
              );
            })}
          {activeTab === 'video' &&
            videos.map((video) => (
              <div key={video.videoId} className="search-result-item">
                <div className="search-result-img">
                  {getLocalizedText(video.imageUrl, locale) ? (
                    <img src={getLocalizedText(video.imageUrl, locale)} alt={getLocalizedText(video.title, locale)} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-elevated)' }} />
                  )}
                </div>
                <div className="search-result-info">
                  <h3 className="search-result-title">{getLocalizedText(video.title, locale)}</h3>
                  <p className="search-result-desc">{getLocalizedText(video.description, locale)}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
