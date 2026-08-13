'use client';

import { usePathname } from 'next/navigation';

export default function CanonicalLink() {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okaz.io';
  // pathname includes the locale, e.g. /ar/search
  // Remove trailing slash if any (except for root)
  const cleanPath = pathname === '/' ? '' : pathname?.replace(/\/$/, '') || '';
  const url = `${baseUrl}${cleanPath}`;
  
  return <link rel="canonical" href={url} />;
}
