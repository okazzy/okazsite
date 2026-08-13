'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getBlogPosts, saveBlogPost } from '@/lib/firebase/firestore';
import { uploadImage } from '@/lib/firebase/storage';
import type { BlogPostModel } from '@/lib/models';
import initialPosts from '@/lib/data/initial-posts.json';
import './admin.css';

export default function AdminPage() {
  const { firebaseUser, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState<BlogPostModel[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPostModel>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (firebaseUser) {
        firebaseUser.getIdTokenResult(true).then((tokenResult) => {
          const roles = tokenResult.claims.roles as string[] | undefined;
          if (roles && (roles.includes('ADMIN') || roles.includes('OWNER'))) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }).catch(err => {
          console.error("Error fetching claims", err);
          setIsAdmin(false);
        });
      }
    }
  }, [loading, isAuthenticated, firebaseUser, router]);

  const fetchPosts = async () => {
    const data = await getBlogPosts();
    setPosts(data);
  };

  useEffect(() => {
    if (isAdmin) fetchPosts();
  }, [isAdmin]);

  const handleMigrate = async () => {
    if (!confirm('Are you sure you want to import 14 WordPress posts? This will overwrite existing posts with the same slugs.')) return;
    
    setMigrating(true);
    setMigrationStatus('Starting migration...');
    
    try {
      let count = 0;
      for (const post of initialPosts as BlogPostModel[]) {
        setMigrationStatus(`Importing ${post.title.en}...`);
        await saveBlogPost(post);
        count++;
      }
      setMigrationStatus(`Successfully imported ${count} posts!`);
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      setMigrationStatus(`Error: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.slug || !currentPost.title?.en) {
      alert('Slug and English Title are required');
      return;
    }

    const postToSave: BlogPostModel = {
      id: currentPost.id || `${currentPost.slug}-${Date.now()}`,
      slug: currentPost.slug,
      title: currentPost.title || { en: '', ar: '' },
      content: currentPost.content || { en: '', ar: '' },
      excerpt: currentPost.excerpt || { en: '', ar: '' },
      imageUrl: currentPost.imageUrl || '',
      youtubeUrl: currentPost.youtubeUrl || { en: '', ar: '' },
      author: currentPost.author || 'Okaz',
      publishedAt: currentPost.publishedAt || Date.now(),
      status: currentPost.status || 'publish'
    };

    try {
      await saveBlogPost(postToSave);
      setIsEditing(false);
      setCurrentPost({});
      fetchPosts();
      alert('Saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving: ' + err.message);
    }
  };

  if (loading || isAdmin === null) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  if (isAdmin === false) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-error)' }}><h2>Unauthorized</h2><p>You must have the ADMIN or OWNER role to view this page.</p></div>;

  return (
    <div className="admin-page">
      <h1>Okaz Admin Dashboard</h1>
      
      {!isEditing ? (
        <>
          <div className="admin-actions">
            <button className="btn-primary" onClick={() => { setCurrentPost({}); setIsEditing(true); }}>
              + Create New Post
            </button>
            <button className="btn-secondary" onClick={handleMigrate} disabled={migrating}>
              {migrating ? 'Importing...' : 'Import WordPress XML Posts'}
            </button>
          </div>
          {migrationStatus && <p style={{ color: 'var(--color-primary)' }}>{migrationStatus}</p>}
          
          <div className="admin-list">
            <h2>Published Posts</h2>
            {posts.length === 0 ? <p>No posts found.</p> : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>{post.title.ar}</td>
                      <td>{new Date(post.publishedAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => { setCurrentPost(post); setIsEditing(true); }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="admin-form">
          <h2>{currentPost.id ? 'Edit Post' : 'Create Post'}</h2>
          
          <label>URL Slug (e.g. my-first-post)
            <input type="text" value={currentPost.slug || ''} onChange={e => setCurrentPost({...currentPost, slug: e.target.value})} required />
          </label>
          
          <div className="form-row">
            <label>Title (Arabic)
              <input type="text" value={currentPost.title?.ar || ''} onChange={e => setCurrentPost({...currentPost, title: { ...currentPost.title, ar: e.target.value } as any})} required />
            </label>
            <label>Title (English)
              <input type="text" value={currentPost.title?.en || ''} onChange={e => setCurrentPost({...currentPost, title: { ...currentPost.title, en: e.target.value } as any})} />
            </label>
          </div>

          <div className="form-row">
            <label>Excerpt (Arabic)
              <textarea value={currentPost.excerpt?.ar || ''} onChange={e => setCurrentPost({...currentPost, excerpt: { ...currentPost.excerpt, ar: e.target.value } as any})} rows={3} />
            </label>
            <label>Excerpt (English)
              <textarea value={currentPost.excerpt?.en || ''} onChange={e => setCurrentPost({...currentPost, excerpt: { ...currentPost.excerpt, en: e.target.value } as any})} rows={3} />
            </label>
          </div>

          <div className="form-row">
            <label>Content HTML (Arabic)
              <textarea value={currentPost.content?.ar || ''} onChange={e => setCurrentPost({...currentPost, content: { ...currentPost.content, ar: e.target.value } as any})} rows={10} required />
            </label>
            <label>Content HTML (English)
              <textarea value={currentPost.content?.en || ''} onChange={e => setCurrentPost({...currentPost, content: { ...currentPost.content, en: e.target.value } as any})} rows={10} />
            </label>
          </div>

          <div className="form-row">
            <label>Cover Image (WebP, JPEG, PNG)
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  try {
                    const url = await uploadImage(file, 'blog-covers');
                    setCurrentPost({...currentPost, imageUrl: url});
                  } catch (err: any) {
                    alert('Upload failed: ' + err.message);
                  } finally {
                    setUploadingImage(false);
                  }
                }} 
              />
              {uploadingImage && <span style={{fontSize: '0.8rem', color: 'var(--color-primary)'}}>Uploading...</span>}
              {currentPost.imageUrl && !uploadingImage && <span style={{fontSize: '0.8rem', color: 'var(--color-success)'}}>Image uploaded successfully</span>}
            </label>
          </div>

          <div className="form-row">
            <label>YouTube Video URL (Arabic)
              <input type="text" placeholder="e.g. https://youtube.com/watch?v=..." value={currentPost.youtubeUrl?.ar || ''} onChange={e => setCurrentPost({...currentPost, youtubeUrl: { ...currentPost.youtubeUrl, ar: e.target.value } as any})} />
            </label>
            <label>YouTube Video URL (English)
              <input type="text" placeholder="e.g. https://youtube.com/watch?v=..." value={currentPost.youtubeUrl?.en || ''} onChange={e => setCurrentPost({...currentPost, youtubeUrl: { ...currentPost.youtubeUrl, en: e.target.value } as any})} />
            </label>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Post</button>
          </div>
        </form>
      )}
    </div>
  );
}
