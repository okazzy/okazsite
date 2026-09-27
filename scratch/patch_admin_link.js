const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/admin/page.tsx', 'utf8');

// Add Link import
if (!content.includes("import { Link } from '@/i18n/routing'")) {
  content = content.replace(
    /import \{ useRouter \} from 'next\/navigation';/,
    `import { useRouter } from 'next/navigation';\nimport { Link } from '@/i18n/routing';`
  );
}

// Replace title td with Link
content = content.replace(
  /<td>\{post\.title\.ar\}<\/td>/,
  `<td>
                        <Link href={\`/blog/\${post.slug}\`} target="_blank" style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}>
                          {post.title.ar}
                        </Link>
                      </td>`
);

fs.writeFileSync('src/app/[locale]/admin/page.tsx', content);
