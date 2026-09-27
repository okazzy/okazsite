const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase/firestore.ts', 'utf8');

// Update getBlogPosts
content = content.replace(
  /export async function getBlogPosts\(\): Promise<BlogPostModel\[\]> \{\n  const blogsRef = collection\(db, 'blogs'\);\n  \/\/ Avoid orderBy to prevent Firestore requiring a composite index, we sort in memory instead\n  const q = query\(blogsRef, where\('status', '==', 'publish'\)\);\n  \n  const snap = await getDocs\(q\);/g,
  `export async function getBlogPosts(includeDrafts = false): Promise<BlogPostModel[]> {
  const blogsRef = collection(db, 'blogs');
  
  const snap = await getDocs(blogsRef);
  let posts = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as BlogPostModel[];
  
  if (!includeDrafts) {
    posts = posts.filter(p => p.status === 'publish');
  }`
);

// Update getBlogPostBySlug
content = content.replace(
  /export async function getBlogPostBySlug\(slug: string\): Promise<BlogPostModel \| null> \{\n  const posts = await getBlogPosts\(\);/g,
  `export async function getBlogPostBySlug(slug: string): Promise<BlogPostModel | null> {
  const posts = await getBlogPosts(true); // Allow previewing drafts`
);

fs.writeFileSync('src/lib/firebase/firestore.ts', content);
