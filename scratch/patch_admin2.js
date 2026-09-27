const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/admin/page.tsx', 'utf8');

content = content.replace(
  /<th>Title<\/th>\n\s*<th>Date<\/th>\n\s*<th>Actions<\/th>/,
  `<th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>`
);

content = content.replace(
  /<td>\{post\.title\.ar\}<\/td>\n\s*<td>\{new Date\(post\.publishedAt\)\.toLocaleDateString\(\)\}<\/td>/,
  `<td>{post.title.ar}</td>
                      <td>
                        <span className={post.status === 'draft' ? 'badge-draft' : 'badge-publish'} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: post.status === 'draft' ? '#f5a623' : '#4caf50', color: '#fff' }}>
                          {post.status === 'draft' ? 'Draft' : 'Published'}
                        </span>
                      </td>
                      <td>{new Date(post.publishedAt).toLocaleDateString()}</td>`
);

fs.writeFileSync('src/app/[locale]/admin/page.tsx', content);
