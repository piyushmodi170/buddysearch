import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homeJsonLd, isIndexablePath, llmsTxt, organizationJsonLd, PAGE_SEO, pageMetadata, PUBLIC_SITEMAP_PATHS, SITE } from './seo.js';
import { llmsFullTxt } from './llms-full.js';

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
  if (['/', '/about', '/privacy', '/terms', '/disclaimer'].includes(route)) {
    assert.equal(isIndexablePath(route), true, route);
    assert.equal((meta.robots as { index?: boolean }).index, true, route);
  }
  if (route === '/login' || route === '/signup') {
    assert.equal(isIndexablePath(route), false, route);
    assert.equal((meta.robots as { index?: boolean }).index, false, route);
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
assert.ok(PAGE_SEO['/about'].title.includes('verified companion'));
assert.ok(PAGE_SEO['/login'].index === false);
assert.ok(!PUBLIC_SITEMAP_PATHS.includes('/login'));
assert.ok(PAGE_SEO['/'].title.includes('Buddy Search |'));
assert.ok(PAGE_SEO['/'].title.includes('Official Site'));
assert.equal(typeof pageMetadata('/').title, 'object');
assert.ok(llmsTxt().includes(SITE.name));
assert.ok(llmsTxt().includes('GPTBot') === false);
assert.ok(llmsTxt().includes('[Home]('));
assert.ok(llmsTxt().includes('[Create account]('));
assert.ok(llmsTxt().includes('[buddysearch.online]('));
assert.ok(llmsTxt().includes('friendship-first'));
assert.ok(llmsTxt().includes('llms-full.txt'));
assert.ok(llmsFullTxt().includes('verified activity companion marketplace'));
assert.ok(llmsFullTxt().includes('/blog/rent-a-friend-what-it-means'));
assert.ok(PAGE_SEO['/press'].index);
assert.ok(PAGE_SEO['/payments'].index);
assert.ok(routes.includes('/payments'));
assert.ok(PAGE_SEO['/contact'].index);
assert.ok(PAGE_SEO['/authors/editorial'].index);
const homeDesc = PAGE_SEO['/'].description;
assert.ok(homeDesc.length >= 80 && homeDesc.length <= 160, `home meta ${homeDesc.length}`);
assert.ok(organizationJsonLd().email.includes('piyushmodi170@gmail.com'));
assert.equal(organizationJsonLd().address.addressCountry, 'IN');
const webPage = homeJsonLd().find((n) => n['@type'] === 'WebPage') as { datePublished?: string; dateModified?: string };
assert.equal(webPage.datePublished, '2026-09-19');
assert.equal(webPage.dateModified, '2026-09-21');
assert.ok(llmsTxt().includes('/contact'));
assert.ok(PAGE_SEO['/contact'].description.length >= 80);
assert.ok(PAGE_SEO['/authors/editorial'].description.length >= 80);

console.log(`seo tests passed (${routes.length} app routes)`);
