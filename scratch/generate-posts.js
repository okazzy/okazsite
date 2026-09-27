const fs = require('fs');

const xmlContent = fs.readFileSync('/Users/zackabasi/Okaz Web/okaz-web/okaz.WordPress.2026-06-28.xml', 'utf-8');

const posts = [];
const itemRegex = /<item>([\s\S]*?)<\/item>/g;
let match;

function stripWPTags(html) {
  // Remove Gutenberg comments
  let clean = html.replace(/<!-- \/?wp:.*?-->/g, '');
  clean = clean.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
  return clean.trim();
}

while ((match = itemRegex.exec(xmlContent)) !== null) {
  const itemStr = match[1];
  
  const titleMatch = itemStr.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemStr.match(/<title>([\s\S]*?)<\/title>/);
  const statusMatch = itemStr.match(/<wp:status><!\[CDATA\[([\s\S]*?)\]\]><\/wp:status>/) || itemStr.match(/<wp:status>([\s\S]*?)<\/wp:status>/);
  const typeMatch = itemStr.match(/<wp:post_type><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_type>/) || itemStr.match(/<wp:post_type>([\s\S]*?)<\/wp:post_type>/);
  const contentMatch = itemStr.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || itemStr.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
  const dateMatch = itemStr.match(/<wp:post_date><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_date>/) || itemStr.match(/<wp:post_date>([\s\S]*?)<\/wp:post_date>/);
  const nameMatch = itemStr.match(/<wp:post_name><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_name>/) || itemStr.match(/<wp:post_name>([\s\S]*?)<\/wp:post_name>/);
  
  const postType = typeMatch ? typeMatch[1] : '';
  const status = statusMatch ? statusMatch[1] : '';
  
  if (postType === 'post' && status === 'publish') {
    const rawContent = contentMatch ? contentMatch[1] : '';
    const cleanContent = stripWPTags(rawContent);
    const date = dateMatch ? dateMatch[1] : '';
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    const slug = nameMatch ? nameMatch[1] : title.replace(/\s+/g, '-');
    
    // Create a plain text excerpt
    const plainText = cleanContent.replace(/<[^>]+>/g, '');
    const excerpt = plainText.substring(0, 150) + '...';

    posts.push({
      id: slug + '-' + Math.floor(Math.random() * 1000),
      slug: slug,
      title: { ar: title, en: title },
      content: { ar: cleanContent, en: cleanContent },
      excerpt: { ar: excerpt, en: excerpt },
      imageUrl: '',
      author: 'Okaz',
      publishedAt: new Date(date).getTime(),
      status: 'publish'
    });
  }
}

fs.writeFileSync('/Users/zackabasi/Okaz Web/okaz-web/src/lib/data/initial-posts.json', JSON.stringify(posts, null, 2));
console.log(`Generated JSON for ${posts.length} posts!`);
