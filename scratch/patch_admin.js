const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/admin/page.tsx', 'utf8');

content = content.replace(
  /const fetchPosts = async \(\) => \{\n    const data = await getBlogPosts\(\);\n    setPosts\(data\);\n  \};/,
  `const fetchPosts = async () => {
    const data = await getBlogPosts(true);
    setPosts(data);
  };`
);

fs.writeFileSync('src/app/[locale]/admin/page.tsx', content);
