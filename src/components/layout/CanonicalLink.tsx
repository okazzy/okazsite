'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isWatchSubcategoryPath, withVideoParam } from '@/lib/videoLink';

/**
 * Canonical of a watch subcategory page, keeping a valid `?v=` so a shared
 * video link (e.g. posted on Facebook, which uses the canonical when og:url is
 * missing) points at that video instead of the plain list.
 */
function WatchCanonicalLink({ url }: { url: string }) {
  const searchParams = useSearchParams();
  return <link rel="canonical" href={withVideoParam(url, searchParams.get('v'))} />;
}

export default function CanonicalLink() {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okaz.io';
  // pathname includes the locale, e.g. /ar/search
  // Remove trailing slash if any (except for root)
  const cleanPath = pathname === '/' ? '' : pathname?.replace(/\/$/, '') || '';
  const url = `${baseUrl}${cleanPath}`;

  // Only the watch subcategory route reads the query string, so the statically
  // prerendered pages never call useSearchParams and keep their canonical in
  // the HTML (React leaves a <link> rendered in a Suspense fallback out of the
  // server HTML, so wrapping every page would drop it). That route is dynamic,
  // so its server HTML already has the `?v=` canonical; the Suspense boundary
  // is what useSearchParams requires, with the plain canonical as fallback.
  if (isWatchSubcategoryPath(cleanPath)) {
    return (
      <Suspense fallback={<link rel="canonical" href={url} />}>
        <WatchCanonicalLink url={url} />
      </Suspense>
    );
  }

  return <link rel="canonical" href={url} />;
}
