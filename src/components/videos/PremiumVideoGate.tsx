'use client';

import { useTranslations } from 'next-intl';
import type { VideoModel } from '@/lib/models';
import { getLocalizedText } from '@/lib/models';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/videoAccess';
import './PremiumVideoGate.css';

interface PremiumVideoGateProps {
  video: VideoModel;
  locale: string;
}

/**
 * Shown in the video modal instead of the player when a premium video is opened
 * by someone who is not a subscriber (see isVideoLocked): the video's picture,
 * "exclusive content", and links to the app.
 */
export default function PremiumVideoGate({ video, locale }: PremiumVideoGateProps) {
  const t = useTranslations();
  const poster = getLocalizedText(video.imageUrl, locale);

  return (
    <div className="premium-gate" role="region" aria-label={t('premiumContentTitle')}>
      {poster && (
        <div className="premium-gate__backdrop" style={{ backgroundImage: `url("${poster.replace(/"/g, '%22')}")` }} />
      )}
      <div className="premium-gate__content">
        <div className="premium-gate__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 className="premium-gate__title">{t('premiumContentTitle')}</h3>
        <p className="premium-gate__desc">{t('premiumContentDesc')}</p>
        <div className="premium-gate__buttons">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="premium-gate__btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 1.44C11 6.44 9.22 5 7 5a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
              <path d="M10 2c1 .5 2 2 2 3.5-1.5.5-3-1.5-3-3.5Z" />
            </svg>
            App Store
          </a>
          <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="premium-gate__btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Google Play
          </a>
        </div>
      </div>
    </div>
  );
}
