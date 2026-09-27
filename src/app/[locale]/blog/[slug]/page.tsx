'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { getBlogPostBySlug, getFavoriteVideos } from '@/lib/firebase/firestore';
import VideoList from '@/components/videos/VideoList';
import { getLocalizedText } from '@/lib/models';
import type { BlogPostModel } from '@/lib/models';
import { Link } from '@/i18n/routing';
import './blog-post.css';

const embedYouTubeInHtml = (html: string) => {
  if (!html) return html;
  
  // 1. Replace URLs inside wp-block-embed__wrapper
  const wrapperRegex = /<div class="wp-block-embed__wrapper">\s*(https?:\/\/[^\s<]+)\s*<\/div>/gi;
  html = html.replace(wrapperRegex, (match, url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      return `<div class="wp-block-embed__wrapper youtube-embed-wrapper" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin:1.5rem 0;">
        <iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>`;
    }
    return match;
  });
  
  // 2. Catch bare youtube URLs that are alone in a paragraph
  const pRegex = /<p>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s<]*)\s*<\/p>/gi;
  html = html.replace(pRegex, (match, url, videoId) => {
    return `<div class="youtube-embed-wrapper" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin:1.5rem 0;">
      <iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>`;
  });

  return html;
};

const getYouTubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
};

export default function BlogPostPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPostModel | null>(null);
  const [firebaseVideo, setFirebaseVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const fetchPost = async () => {
      try {
        const data = await getBlogPostBySlug(slug);
        if (!data) {
          router.push('/blog');
          return;
        }
        setPost(data);
        if (data.firebaseVideoId) {
          const videos = await getFavoriteVideos([data.firebaseVideoId]);
          if (videos.length > 0) setFirebaseVideo(videos[0]);
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="blog-post-page loading">
        <div className="shimmer" style={{ height: '400px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <div className="shimmer" style={{ height: '40px', width: '60%', marginBottom: '1rem' }} />
        <div className="shimmer" style={{ height: '20px', width: '30%', marginBottom: '3rem' }} />
        <div className="shimmer" style={{ height: '20px', marginBottom: '0.5rem' }} />
        <div className="shimmer" style={{ height: '20px', marginBottom: '0.5rem' }} />
        <div className="shimmer" style={{ height: '20px', width: '80%' }} />
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="blog-post-page">
      <Link href="/blog" className="back-link">
        {locale === 'ar' ? '← العودة للمدونة' : '← Back to Blog'}
      </Link>

      <header className="blog-post-header">
        <h1 className="blog-post-title">{getLocalizedText(post.title, locale)}</h1>
        <div className="blog-post-meta">
          <span className="blog-post-author">{post.author}</span>
          <span className="blog-post-date">
            {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </header>

      {post.imageUrl && (
        <div className="blog-post-hero-image">
          <img src={post.imageUrl} alt={getLocalizedText(post.title, locale)} />
        </div>
      )}

      {/* Since this content comes from a trusted CMS (Admin/WordPress XML), we use dangerouslySetInnerHTML */}
      <div 
        className="blog-post-content"
        dangerouslySetInnerHTML={{ 
          __html: embedYouTubeInHtml(getLocalizedText(post.content, locale)) 
        }}
      />

      {getYouTubeId(getLocalizedText(post.youtubeUrl || {}, locale)) && (
        <div className="youtube-embed-wrapper" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', margin: '2rem 0' }}>
          <iframe 
            src={`https://www.youtube.com/embed/${getYouTubeId(getLocalizedText(post.youtubeUrl || {}, locale))}`} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      )}
    
      {firebaseVideo && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{locale === 'ar' ? 'فيديو ذو صلة' : 'Related Video'}</h3>
          <VideoList videos={[firebaseVideo]} locale={locale} />
        </div>
      )}
    </article>
  );
}
