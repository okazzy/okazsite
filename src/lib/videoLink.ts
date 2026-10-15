/**
 * Shared video links: /{locale}/watch/{categoryId}/{subcategoryId}?v={videoId}
 * opens that exact video on the subcategory page.
 */

/** Longest `?v=` value accepted from a link (real video ids are much shorter). */
export const MAX_VIDEO_PARAM_LENGTH = 200;

/** The video id from a shared link's `?v=`, or null when missing or invalid. */
export function readVideoParam(value: string | null): string | null {
  return value && value.length <= MAX_VIDEO_PARAM_LENGTH ? value : null;
}

/** True for /{locale}/watch/{categoryId}/{subcategoryId} (no trailing slash), the only page that reads `?v=`. */
export function isWatchSubcategoryPath(path: string): boolean {
  return /^\/[^/]+\/watch\/[^/]+\/[^/]+$/.test(path);
}

/** `url` with `?v={videoId}` (URL-encoded) when `value` is a valid video id, else `url` unchanged. */
export function withVideoParam(url: string, value: string | null): string {
  const videoId = readVideoParam(value);
  return videoId ? `${url}?v=${encodeURIComponent(videoId)}` : url;
}
