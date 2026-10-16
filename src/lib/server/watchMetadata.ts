/**
 * Link-preview metadata (Open Graph / Twitter card) for the watch subcategory
 * page, so a shared /{locale}/watch/{categoryId}/{subcategoryId}?v={videoId}
 * shows that video's title, description and thumbnail on Facebook, WhatsApp,
 * X, Telegram, ...
 *
 * Firestore is reached through a FirestoreReader (the REST reader in
 * firestoreRest.ts, or a fake in tests/watchMetadata.test.mjs). With no reader
 * (FIREBASE_SERVICE_ACCOUNT_JSON not set) or on any failure the result is {},
 * which keeps the generic metadata from src/app/[locale]/layout.tsx.
 */
import type { Metadata } from 'next';
import type { FirestoreDoc, FirestoreReader } from '@/lib/server/firestoreRest';
import { readVideoParam, withVideoParam } from '@/lib/videoLink';
import { getLocalizedText } from '@/lib/models/category';

export const SITE_NAME = 'Okaz | عكاظ';
/** Longest description put in a preview (characters). */
export const MAX_DESCRIPTION_LENGTH = 200;
/** Give up on Firestore after this long and use the generic metadata. */
export const METADATA_DEADLINE_MS = 4500;

export interface WatchPageArgs {
  locale: string;
  categoryId: string;
  subcategoryId: string;
  /** Raw `?v=` value (first one when repeated). */
  v: string | null | undefined;
  /** Site origin, e.g. https://www.okaz.io (same as CanonicalLink). */
  baseUrl: string;
}

/** The page URL without query, built like CanonicalLink's. */
export function watchPageUrl({ baseUrl, locale, categoryId, subcategoryId }: WatchPageArgs): string {
  return `${baseUrl}/${[locale, 'watch', categoryId, subcategoryId].map(encodeURIComponent).join('/')}`;
}

/** The id the site uses for a video: its `videoId` field, else the document id (as getVideos does). */
export function videoIdOf(doc: FirestoreDoc): string {
  const field = doc.data.videoId;
  return typeof field === 'string' && field ? field : doc.id;
}

/** The first candidate whose video id is `videoId` and that is not hidden. */
export function pickVisibleVideo(
  candidates: (FirestoreDoc | null | undefined)[],
  videoId: string
): FirestoreDoc | null {
  for (const doc of candidates) {
    if (doc && videoIdOf(doc) === videoId && !doc.data.hide) return doc;
  }
  return null;
}

/** Whitespace collapsed, cut on a word boundary to at most `max` characters (with an ellipsis). */
export function trimDescription(text: string, max = MAX_DESCRIPTION_LENGTH): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chars = Array.from(clean); // code points, so emoji are never split
  if (chars.length <= max) return clean;
  const cut = chars.slice(0, max - 1).join('');
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

function localized(field: unknown, locale: string): string {
  return getLocalizedText(field, locale).trim();
}

function absoluteImageUrl(url: string): string | null {
  return /^https?:\/\/\S+$/i.test(url) ? url : null;
}

interface Card {
  title: string;
  description: string;
  image: string | null;
  type: 'video.other' | 'website';
}

function cardMetadata(card: Card, url: string, locale: string): Metadata {
  const description = card.description || undefined;
  return {
    title: `${card.title} | ${SITE_NAME}`,
    ...(description ? { description } : {}),
    openGraph: {
      type: card.type,
      url,
      siteName: SITE_NAME,
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      title: card.title,
      ...(description ? { description } : {}),
      ...(card.image ? { images: [{ url: card.image, alt: card.title }] } : {}),
    },
    twitter: {
      card: card.image ? 'summary_large_image' : 'summary',
      title: card.title,
      ...(description ? { description } : {}),
      ...(card.image ? { images: [card.image] } : {}),
    },
  };
}

/**
 * Metadata from already-loaded documents. `video` must be the visible video
 * named by `?v=` (or null); `subcategory` the subcategory doc (or null).
 */
export function buildWatchMetadata(
  args: WatchPageArgs,
  video: FirestoreDoc | null,
  subcategory: FirestoreDoc | null
): Metadata {
  const { locale } = args;
  // Same URL as the canonical link (CanonicalLink keeps a valid ?v=).
  const url = withVideoParam(watchPageUrl(args), args.v ?? null);
  const subcategoryImage = subcategory ? absoluteImageUrl(localized(subcategory.data.imageUrl, locale)) : null;

  if (video) {
    const title = localized(video.data.title, locale);
    if (title) {
      return cardMetadata(
        {
          title,
          description: trimDescription(localized(video.data.description, locale)),
          image: absoluteImageUrl(localized(video.data.imageUrl, locale)) ?? subcategoryImage,
          type: 'video.other',
        },
        url,
        locale
      );
    }
  }

  if (subcategory) {
    const title = localized(subcategory.data.title, locale);
    if (title) {
      return cardMetadata({ title, description: '', image: subcategoryImage, type: 'website' }, url, locale);
    }
  }

  return {};
}

async function loadDocs(args: WatchPageArgs, reader: FirestoreReader): Promise<Metadata> {
  const videoId = readVideoParam(args.v ?? null);
  const parent = ['video_categories', args.categoryId, 'subcategories', args.subcategoryId];
  // One round trip: the subcategory, the video by document id, and the video
  // by its `videoId` field (used when the document id differs from it).
  const [subcategory, byDocId, byField] = await Promise.all([
    reader.getDocument(parent),
    videoId ? reader.getDocument([...parent, 'videos', videoId]) : null,
    videoId ? reader.findOneByField(parent, 'videos', 'videoId', videoId) : null,
  ]);
  const video = videoId ? pickVisibleVideo([byDocId, byField], videoId) : null;
  return buildWatchMetadata(args, video, subcategory);
}

/**
 * Metadata for the watch subcategory page; {} (generic layout metadata) when
 * there is no reader, nothing is found, anything fails or Firestore is slower
 * than `deadlineMs`.
 */
export async function loadWatchMetadata(
  args: WatchPageArgs,
  reader: FirestoreReader | null,
  deadlineMs = METADATA_DEADLINE_MS
): Promise<Metadata> {
  if (!reader) return {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<Metadata>((resolve) => {
    timer = setTimeout(() => resolve({}), deadlineMs);
  });
  try {
    return await Promise.race([loadDocs(args, reader).catch(() => ({})), deadline]);
  } finally {
    clearTimeout(timer);
  }
}
