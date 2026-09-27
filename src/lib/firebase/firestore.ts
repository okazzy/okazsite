import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  collectionGroup,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  where,
  limit,
  setDoc,
} from 'firebase/firestore';
import type {
  CategoryModel,
  SubcategoryModel,
  TrackModel,
  VideoModel,
  QuoteModel,
  UserModel,
} from '../models';
import { getLocalizedText } from '../models';

/* ================================================================== */
/*  Firestore → TypeScript parsers                                    */
/* ================================================================== */

function parseCategory(id: string, data: Record<string, unknown>): CategoryModel {
  return {
    id,
    title: (data.title as Record<string, string>) ?? {},
    imageUrl: (data.imageUrl as string) ?? '',
    orderId: (data.orderId as number) ?? 0,
  };
}

function parseSubcategory(id: string, data: Record<string, unknown>): SubcategoryModel {
  return {
    id,
    title: (data.title as Record<string, string>) ?? {},
    imageUrl: (data.imageUrl as string) ?? '',
    orderId: (data.orderId as number) ?? 0,
  };
}

function parseTrack(id: string, data: Record<string, unknown>): TrackModel {
  return {
    trackId: (data.trackId as string) || id,
    title: (data.title as Record<string, string>) ?? {},
    description: (data.description as Record<string, string>) ?? {},
    imageUrl: (data.imageUrl as Record<string, string>) ?? {},
    audioUrl: (data.audioUrl as Record<string, string>) ?? {},
    orderId: (data.orderId as number) ?? 0,
    isPremium: (data.isPremium as boolean) ?? false,
    categoryId: (data.categoryId as string) ?? undefined,
    subcategoryId: (data.subcategoryId as string) ?? undefined,
    hide: (data.hide as boolean) ?? false,
  };
}

function parseVideo(id: string, data: Record<string, unknown>): VideoModel {
  return {
    videoId: (data.videoId as string) || id,
    title: (data.title as Record<string, string>) ?? {},
    description: (data.description as Record<string, string>) ?? {},
    imageUrl: (data.imageUrl as Record<string, string>) ?? {},
    videoUrl: (data.videoUrl as Record<string, string>) ?? {},
    orderId: (data.orderId as number) ?? 0,
    isPremium: (data.isPremium as boolean) ?? false,
    isPractice: (data.isPractice as boolean) ?? false,
    hide: (data.hide as boolean) ?? false,
  };
}

function parseUser(data: Record<string, unknown>): UserModel {
  return {
    uid: (data.uid as string) ?? '',
    email: (data.email as string) ?? undefined,
    displayName: (data.displayName as string) ?? undefined,
    photoUrl: (data.photoUrl as string) ?? undefined,
    isPremium: (data.isPremium as boolean) ?? false,
    isGuest: (data.isGuest as boolean) ?? true,
    favorites: (data.favorites as string[]) ?? [],
    favoriteVideos: (data.favoriteVideos as string[]) ?? [],
    dailyPlays: (data.dailyPlays as number) ?? 0,
    lastPlayedDate: (data.lastPlayedDate as Timestamp) ?? undefined,
  };
}

/* ================================================================== */
/*  Utility                                                           */
/* ================================================================== */

/** Fisher-Yates shuffle and return first `count` items. */
function pickRandom<T>(items: T[], count: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

/* ================================================================== */
/*  Daily Quote                                                       */
/* ================================================================== */

export async function getDailyQuote(langCode: string): Promise<QuoteModel | null> {
  const ref = doc(db, 'quotes', langCode);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    quoteText: (data.daily_quote_text as string) ?? '',
    authorName: (data.daily_author as string) ?? '',
    date: (data.daily_date as string) ?? undefined,
  };
}

/* ================================================================== */
/*  Audio Categories / Subcategories / Tracks                         */
/* ================================================================== */

export async function getCategories(): Promise<CategoryModel[]> {
  const q = query(collection(db, 'categories'), orderBy('orderId', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseCategory(d.id, d.data() as Record<string, unknown>));
}

export async function getSubcategories(
  categoryId: string
): Promise<SubcategoryModel[]> {
  const q = query(
    collection(db, 'categories', categoryId, 'subcategories'),
    orderBy('orderId', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    parseSubcategory(d.id, d.data() as Record<string, unknown>)
  );
}

export async function getTracks(
  categoryId: string,
  subcategoryId: string
): Promise<TrackModel[]> {
  const q = query(
    collection(
      db,
      'categories',
      categoryId,
      'subcategories',
      subcategoryId,
      'tracks'
    ),
    orderBy('orderId', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => parseTrack(d.id, d.data() as Record<string, unknown>))
    .filter((t) => !t.hide);
}

/* ================================================================== */
/*  Video Categories / Subcategories / Videos                         */
/* ================================================================== */

export async function getVideoCategories(): Promise<CategoryModel[]> {
  const q = query(
    collection(db, 'video_categories'),
    orderBy('orderId', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseCategory(d.id, d.data() as Record<string, unknown>));
}

export async function getVideoSubcategories(
  categoryId: string
): Promise<SubcategoryModel[]> {
  const q = query(
    collection(db, 'video_categories', categoryId, 'subcategories'),
    orderBy('orderId', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    parseSubcategory(d.id, d.data() as Record<string, unknown>)
  );
}

export async function getVideos(
  categoryId: string,
  subcategoryId: string
): Promise<VideoModel[]> {
  const q = query(
    collection(
      db,
      'video_categories',
      categoryId,
      'subcategories',
      subcategoryId,
      'videos'
    ),
    orderBy('orderId', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => parseVideo(d.id, d.data() as Record<string, unknown>))
    .filter((v) => !v.hide);
}

/* ================================================================== */
/*  Featured / Highlight helpers                                      */
/* ================================================================== */

export async function getRandomFeaturedVideos(
  count: number
): Promise<VideoModel[]> {
  const categories = await getVideoCategories();
  const allVideos: VideoModel[] = [];

  // Fetch all subcategories in parallel
  const subPromises = categories.map(cat => getVideoSubcategories(cat.id));
  const subResults = await Promise.all(subPromises);

  // Fetch all videos in parallel
  const videoPromises: Promise<VideoModel[]>[] = [];
  categories.forEach((cat, i) => {
    subResults[i].forEach(sub => {
      videoPromises.push(getVideos(cat.id, sub.id));
    });
  });

  const videoResults = await Promise.all(videoPromises);
  allVideos.push(...videoResults.flat());

  return pickRandom(allVideos, count);
}

export async function getCategoryHighlightTracks(
  categoryId: string,
  count: number
): Promise<TrackModel[]> {
  const subs = await getSubcategories(categoryId);
  
  // Fetch all tracks in parallel
  const trackPromises = subs.map(sub => getTracks(categoryId, sub.id));
  const trackResults = await Promise.all(trackPromises);
  
  const allTracks = trackResults.flat();
  return pickRandom(allTracks, count);
}

/* ================================================================== */
/*  Search (client-side filtering via collectionGroup)                */
/* ================================================================== */

export async function searchTracks(
  queryText: string,
  langCode: string
): Promise<TrackModel[]> {
  const snap = await getDocs(collectionGroup(db, 'tracks'));
  const lowerQuery = queryText.toLowerCase();

  return snap.docs
    .map((d) => parseTrack(d.id, d.data() as Record<string, unknown>))
    .filter((track) => !track.hide)
    .filter((track) => {
      const titleAr = getLocalizedText(track.title, 'ar').toLowerCase();
      const titleEn = getLocalizedText(track.title, 'en').toLowerCase();
      const titleLang = getLocalizedText(track.title, langCode).toLowerCase();
      return (
        titleAr.includes(lowerQuery) ||
        titleEn.includes(lowerQuery) ||
        titleLang.includes(lowerQuery)
      );
    });
}

export async function searchVideos(
  queryText: string,
  langCode: string
): Promise<VideoModel[]> {
  const snap = await getDocs(collectionGroup(db, 'videos'));
  const lowerQuery = queryText.toLowerCase();

  return snap.docs
    .map((d) => parseVideo(d.id, d.data() as Record<string, unknown>))
    .filter((video) => !video.hide)
    .filter((video) => {
      const titleAr = getLocalizedText(video.title, 'ar').toLowerCase();
      const titleEn = getLocalizedText(video.title, 'en').toLowerCase();
      const titleLang = getLocalizedText(video.title, langCode).toLowerCase();
      return (
        titleAr.includes(lowerQuery) ||
        titleEn.includes(lowerQuery) ||
        titleLang.includes(lowerQuery)
      );
    });
}

/* ================================================================== */
/*  Favorites                                                         */
/* ================================================================== */

export async function getFavoriteTracks(
  trackIds: string[]
): Promise<TrackModel[]> {
  if (trackIds.length === 0) return [];

  const snap = await getDocs(collectionGroup(db, 'tracks'));
  const allTracks = snap.docs
    .map((d) => parseTrack(d.id, d.data() as Record<string, unknown>))
    .filter((t) => !t.hide)
    .filter((t) => trackIds.includes(t.trackId));

  // Deduplicate by trackId
  const uniqueTracks: TrackModel[] = [];
  const seen = new Set<string>();
  for (const t of allTracks) {
    if (!seen.has(t.trackId)) {
      seen.add(t.trackId);
      uniqueTracks.push(t);
    }
  }
  return uniqueTracks;
}

export async function getFavoriteVideos(
  videoIds: string[]
): Promise<VideoModel[]> {
  if (videoIds.length === 0) return [];

  const snap = await getDocs(collectionGroup(db, 'videos'));
  const allVideos = snap.docs
    .map((d) => parseVideo(d.id, d.data() as Record<string, unknown>))
    .filter((v) => !v.hide)
    .filter((v) => videoIds.includes(v.videoId));

  // Deduplicate by videoId
  const uniqueVideos: VideoModel[] = [];
  const seen = new Set<string>();
  for (const v of allVideos) {
    if (!seen.has(v.videoId)) {
      seen.add(v.videoId);
      uniqueVideos.push(v);
    }
  }
  return uniqueVideos;
}

export async function toggleFavorite(
  uid: string,
  trackId: string
): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return false;

  const data = snap.data();
  const favorites = (data.favorites as string[]) ?? [];
  const isFav = favorites.includes(trackId);

  await updateDoc(userRef, {
    favorites: isFav ? arrayRemove(trackId) : arrayUnion(trackId),
  });

  return !isFav;
}

export async function toggleFavoriteVideo(
  uid: string,
  videoId: string
): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return false;

  const data = snap.data();
  const favoriteVideos = (data.favoriteVideos as string[]) ?? [];
  const isFav = favoriteVideos.includes(videoId);

  await updateDoc(userRef, {
    favoriteVideos: isFav ? arrayRemove(videoId) : arrayUnion(videoId),
  });

  return !isFav;
}

/* ================================================================== */
/*  User Data                                                         */
/* ================================================================== */

export async function getUserData(uid: string): Promise<UserModel | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return parseUser(snap.data() as Record<string, unknown>);
}

/* ================================================================== */
/*  Guest Limit                                                       */
/* ================================================================== */

export async function getGuestLimit(): Promise<number> {
  const snap = await getDoc(doc(db, 'app_settings', 'guest_limit'));
  if (!snap.exists()) return 3; // sensible default
  const data = snap.data();
  return (data.limit as number) ?? 3;
}

/* ================================================================== */
/*  Daily Play Tracking                                               */
/* ================================================================== */

export async function incrementDailyPlays(uid: string): Promise<number> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  let currentPlays = 0;

  if (snap.exists()) {
    const data = snap.data();
    const lastPlayed = data.lastPlayedDate as Timestamp | undefined;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    currentPlays = (data.dailyPlays as number) ?? 0;

    // Reset count if last played date is a different day
    if (lastPlayed) {
      const lastDate = lastPlayed.toDate();
      const lastDay = new Date(
        lastDate.getFullYear(),
        lastDate.getMonth(),
        lastDate.getDate()
      );
      if (lastDay.getTime() < today.getTime()) {
        currentPlays = 0;
      }
    }
  }

  const newPlays = currentPlays + 1;

  await setDoc(userRef, {
    uid,
    isGuest: true,
    dailyPlays: newPlays,
    lastPlayedDate: Timestamp.now(),
  }, { merge: true });

  return newPlays;
}

// =======================
// BLOG FUNCTIONS
// =======================

import type { BlogPostModel } from '../models';

export async function getBlogPosts(includeDrafts = false): Promise<BlogPostModel[]> {
  const blogsRef = collection(db, 'blogs');
  
  const snap = await getDocs(blogsRef);
  let posts = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as BlogPostModel[];
  
  if (!includeDrafts) {
    posts = posts.filter(p => p.status === 'publish');
  }
  
  // Sort descending by publishedAt
  return posts.sort((a, b) => b.publishedAt - a.publishedAt);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostModel | null> {
  const posts = await getBlogPosts(true); // Allow previewing drafts
  let decodedSlug = slug;
  try { decodedSlug = decodeURIComponent(slug); } catch {}
  
  return posts.find(p => {
    let pDecoded = p.slug;
    try { pDecoded = decodeURIComponent(p.slug); } catch {}
    return pDecoded === decodedSlug || p.slug === slug;
  }) || null;
}

export async function saveBlogPost(post: BlogPostModel): Promise<void> {
  const docRef = doc(db, 'blogs', post.id);
  await setDoc(docRef, post, { merge: true });
}
