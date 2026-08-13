export interface BlogPostModel {
  id: string;
  slug: string;
  title: Record<string, string>; // e.g. { ar: "Title", en: "Title" }
  content: Record<string, string>; // HTML content
  excerpt: Record<string, string>;
  imageUrl: string;
  youtubeUrl?: Record<string, string>; // e.g. { ar: "https://...", en: "https://..." }
  author: string;
  publishedAt: number; // timestamp in ms
  status: 'publish' | 'draft';
}
