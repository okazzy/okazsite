export interface BlogPostModel {
  id: string;
  slug: string;
  title: Record<string, string>; // e.g. { ar: "Title", en: "Title" }
  content: Record<string, string>; // HTML content
  excerpt: Record<string, string>;
  imageUrl: string;
  youtubeUrl?: Record<string, string>; // e.g. { ar: "https://...", en: "https://..." }
  firebaseVideoId?: string; // Links to a VideoModel doc id in Firestore
  author: string;
  publishedAt: number; // timestamp in ms
  status: 'publish' | 'draft';
}
