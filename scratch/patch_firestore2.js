const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase/firestore.ts', 'utf8');

content = content.replace(
  /  if \(!includeDrafts\) \{\n    posts = posts\.filter\(p => p\.status === 'publish'\);\n  \}\n  const posts = snap\.docs\.map\(doc => \(\{\n    id: doc\.id,\n    \.\.\.doc\.data\(\)\n  \}\)\) as BlogPostModel\[\];/,
  `  if (!includeDrafts) {
    posts = posts.filter(p => p.status === 'publish');
  }`
);

fs.writeFileSync('src/lib/firebase/firestore.ts', content);
