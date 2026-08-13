import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.okaz.io';
  
  // Standard routes in both languages
  const routes = [
    '',
    '/listen',
    '/watch',
    '/search',
    '/favorites',
    '/settings',
    '/blog',
    '/contact',
    '/qa',
    '/privacy',
    '/terms',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const priority = route === '' ? 1 : 0.8;
    const alternates = {
      languages: {
        ar: `${baseUrl}/ar${route}`,
        en: `${baseUrl}/en${route}`,
      },
    };

    // Arabic route
    sitemapEntries.push({
      url: `${baseUrl}/ar${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority,
      alternates,
    });
    
    // English route
    sitemapEntries.push({
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority,
      alternates,
    });
  }

  return sitemapEntries;
}
