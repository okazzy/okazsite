import type { Metadata } from 'next';
import { createFirestoreReader } from '@/lib/server/firestoreRest';
import { loadWatchMetadata } from '@/lib/server/watchMetadata';
import WatchVideosClient from './WatchVideosClient';

type Props = {
  params: Promise<{ locale: string; categoryId: string; subcategoryId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Link preview for a shared video (?v=) or the subcategory, read from Firestore
 * on the server as an anonymous guest (see firestoreRest.ts). On any failure it
 * returns {} and the generic layout metadata is used.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  // Not wrapped in try/catch: awaiting params/searchParams is how Next.js
  // detects request-time rendering. loadWatchMetadata itself never throws.
  const [{ locale, categoryId, subcategoryId }, query] = await Promise.all([params, searchParams]);
  const v = Array.isArray(query.v) ? query.v[0] : query.v;
  return loadWatchMetadata(
    {
      locale,
      categoryId,
      subcategoryId,
      v,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.okaz.io',
    },
    createFirestoreReader()
  );
}

export default function WatchVideosPage() {
  return <WatchVideosClient />;
}
