'use client';

import { useAudio } from '@/contexts/AudioContext';
import { getLocalizedText } from '@/lib/models';
import FavoriteButton from '@/components/ui/FavoriteButton';
import './layout.css';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);
const PrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);
const Forward10Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 0-9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><polyline points="21 11 21 16 16 16"/>
    <text x="12" y="16" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
  </svg>
);
const Replay10Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/>
    <text x="12" y="16" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
  </svg>
);
const ShuffleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
  </svg>
);
const LoopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

function formatTime(secs: number) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MiniPlayer({ locale }: { locale: string }) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    closeMiniPlayer,
    showMiniPlayer,
    nextTrack,
    previousTrack,
    skipForward,
    skipBackward,
    toggleLoop,
    toggleShuffle,
    isLooping,
    isShuffled,
    currentTime,
    duration,
    seekTo,
  } = useAudio();

  if (!currentTrack) return null;

  const title = getLocalizedText(currentTrack.title, locale);
  const imageUrl = getLocalizedText(currentTrack.imageUrl, locale);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  return (
    <div className={`mini-player ${!showMiniPlayer ? 'hidden' : ''}`}>
      {/* Progress Bar (absolute top) */}
      <div className="mini-player-progress-container">
        <input
          type="range"
          className="mini-player-progress-bar"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className="mini-player-progress-fill"
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        />
      </div>

      <div className="mini-player-content">
        <div className="mini-player-left">
          {imageUrl && (
            <img className="mini-player-img" src={imageUrl} alt={title} />
          )}
          <div className="mini-player-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="mini-player-title">{title}</div>
              {currentTrack && (
                <FavoriteButton itemId={currentTrack.trackId} type="track" className="inline" />
              )}
            </div>
            <div className="mini-player-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        <div className="mini-player-controls-center" dir="ltr">
          <button
            className={`mini-player-btn-small ${isShuffled ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
            title="Shuffle"
          >
            <ShuffleIcon />
          </button>
          
          <button
            className="mini-player-btn-small"
            onClick={(e) => { e.stopPropagation(); skipBackward(10); }}
            title="-10s"
          >
            <Replay10Icon />
          </button>
          
          <button
            className="mini-player-btn"
            onClick={(e) => { e.stopPropagation(); previousTrack(); }}
            title="Previous"
          >
            <PrevIcon />
          </button>

          <button
            className="mini-player-btn play-btn"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="mini-player-btn"
            onClick={(e) => { e.stopPropagation(); nextTrack(); }}
            title="Next"
          >
            <NextIcon />
          </button>
          
          <button
            className="mini-player-btn-small"
            onClick={(e) => { e.stopPropagation(); skipForward(10); }}
            title="+10s"
          >
            <Forward10Icon />
          </button>

          <button
            className={`mini-player-btn-small ${isLooping ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleLoop(); }}
            title="Loop"
          >
            <LoopIcon />
          </button>
        </div>

        <div className="mini-player-right">
          <button
            className="mini-player-btn close-btn"
            onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
