import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isIndexablePath, llmsTxt, PAGE_SEO, pageMetadata, PUBLIC_SITEMAP_PATHS, SITE } from './seo.js';

const appRoot = join(process.cwd(), 'src/app');

function pageRoutes(dir: string, prefix = ''): string[] {
  const routes: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || name === 'LandingClient.tsx') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const segment = name.startsWith('(') && name.endsWith(')') ? '' : `/${name.replace(/\.txt$/, '')}`;
      routes.push(...pageRoutes(full, `${prefix}${segment}`));
      continue;
    }
    if (name === 'page.tsx') routes.push(prefix || '/');
  }
  return routes;
}

const routes = pageRoutes(appRoot);
assert.ok(routes.includes('/'), 'home route');
assert.ok(routes.includes('/about'));
assert.ok(routes.includes('/privacy'));
assert.ok(routes.includes('/terms'));
assert.ok(routes.includes('/login'));

for (const route of routes) {
  const meta = pageMetadata(route);
  assert.ok(meta.title, route);
  assert.ok(meta.description, route);
  assert.ok(meta.openGraph, route);
  assert.ok(meta.twitter, route);
  if (['/', '/about', '/login', '/signup', '/privacy', '/terms', '/disclaimer'].includes(route)) {
    assert.equal(isIndexablePath(route), true, route);
    assert.equal((meta.robots as { index?: boolean }).index, true, route);
  }
  if (route.startsWith('/admin') || route === '/find' || route === '/messages') {
    assert.equal(isIndexablePath(route), false, route);
    assert.equal((meta.robots as { index?: boolean }).index, false, route);
  }
}

assert.deepEqual(
  [...PUBLIC_SITEMAP_PATHS].sort(),
  Object.values(PAGE_SEO).filter((p) => p.index).map((p) => p.path).sort(),
);
assert.ok(typeof PAGE_SEO['/'].title === 'string');
assert.ok(PAGE_SEO['/'].title.includes('Buddy Search |'));
assert.ok(PAGE_SEO['/'].title.includes('Official Site'));
assert.equal(typeof pageMetadata('/').title, 'object');
assert.ok(llmsTxt().includes(SITE.name));
assert.ok(llmsTxt().includes('GPTBot') === false);
assert.ok(llmsTxt().includes('[Home]('));
assert.ok(llmsTxt().includes('[Create account]('));
assert.ok(llmsTxt().includes('[buddysearch.online]('));
assert.ok(llmsTxt().includes('friendship-first'));

console.log(`seo tests passed (${routes.length} app routes)`);
