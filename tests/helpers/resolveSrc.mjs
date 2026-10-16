// Lets plain Node load src/ TypeScript modules that use the '@/...' path alias
// or extensionless relative imports (as Next.js allows). Import this file
// first, then load the module under test with a dynamic `await import(...)`.
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = new URL('../../src/', import.meta.url);

function withExtension(url) {
  if (/\.[cm]?[jt]sx?$/.test(url.pathname)) return url;
  for (const suffix of ['.ts', '.tsx', '/index.ts']) {
    const candidate = new URL(url.href + suffix);
    if (existsSync(fileURLToPath(candidate))) return candidate;
  }
  return url;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(withExtension(new URL(specifier.slice(2), SRC)).href, context);
    }
    if (/^\.\.?\//.test(specifier) && context.parentURL?.startsWith(SRC.href)) {
      return nextResolve(withExtension(new URL(specifier, context.parentURL)).href, context);
    }
    return nextResolve(specifier, context);
  },
});
