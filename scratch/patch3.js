const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/blog/[slug]/page.tsx', 'utf8');

// Import getFavoriteVideos and VideoList
content = content.replace(
  /import { getBlogPostBySlug } from '@\/lib\/firebase\/firestore';/,
  `import { getBlogPostBySlug, getFavoriteVideos } from '@/lib/firebase/firestore';\nimport VideoList from '@/components/videos/VideoList';`
);

// Add state for firebaseVideo
content = content.replace(
  /const \[post, setPost\] = useState<BlogPostModel \| null>\(null\);\n\s*const \[loading, setLoading\] = useState\(true\);/,
  `const [post, setPost] = useState<BlogPostModel | null>(null);\n  const [firebaseVideo, setFirebaseVideo] = useState<any>(null);\n  const [loading, setLoading] = useState(true);`
);

// Fetch firebaseVideo if post.firebaseVideoId is set
content = content.replace(
  /setPost\(data\);\n\s*\} catch \(err\)/,
  `setPost(data);\n        if (data.firebaseVideoId) {\n          const videos = await getFavoriteVideos([data.firebaseVideoId]);\n          if (videos.length > 0) setFirebaseVideo(videos[0]);\n        }\n      } catch (err)`
);

// Render VideoList at the end
content = content.replace(
  /<\/article>/,
  `
      {firebaseVideo && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{locale === 'ar' ? 'فيديو ذو صلة' : 'Related Video'}</h3>
          <VideoList videos={[firebaseVideo]} locale={locale} />
        </div>
      )}
    </article>`
);

fs.writeFileSync('src/app/[locale]/blog/[slug]/page.tsx', content);
