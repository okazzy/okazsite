/**
 * Who can play a video on the website. Premium videos play only for signed-in
 * subscribers; everyone else sees the "exclusive content" panel that sends them
 * to the app (PremiumVideoGate) instead of the player.
 */

/** App store pages for the Okaz app. */
export const APP_STORE_URL = 'https://apps.apple.com/app/okaz/id6780990007';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.okaz.awakening';

/** True when `video` is premium and the visitor is not a subscriber. */
export function isVideoLocked(
  video: { isPremium?: boolean },
  user: { isPremium?: boolean; isGuest?: boolean } | null | undefined
): boolean {
  if (video.isPremium !== true) return false;
  return !(user && user.isPremium === true && user.isGuest !== true);
}
