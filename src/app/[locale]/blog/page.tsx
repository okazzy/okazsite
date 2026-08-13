'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/firebase/firestore';
import { getLocalizedText } from '@/lib/models';
import type { BlogPostModel } from '@/lib/models';
import './blog.css';

export default function BlogPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPostModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1 className="blog-title">{locale === 'ar' ? 'المدونة' : 'Blog'}</h1>
        <p className="blog-subtitle">
          {locale === 'ar' 
            ? 'مقالات وقراءات في الوعي والتأمل' 
            : 'Articles and readings on mindfulness and meditation'}
        </p>
      </div>

      {loading ? (
        <div className="blog-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer blog-card-shimmer" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <p>{locale === 'ar' ? 'لا توجد مقالات بعد.' : 'No articles yet.'}</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
              {post.imageUrl && (
                <div className="blog-card-image-wrapper">
                  <img src={post.imageUrl} alt={getLocalizedText(post.title, locale)} className="blog-card-image" loading="lazy" />
                </div>
              )}
              <div className="blog-card-content">
                <span className="blog-card-date">
                  {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <h2 className="blog-card-title">{getLocalizedText(post.title, locale)}</h2>
                <p className="blog-card-excerpt">{getLocalizedText(post.excerpt, locale)}</p>
                <span className="blog-card-read-more">
                  {locale === 'ar' ? 'اقرأ المزيد ←' : 'Read more →'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
