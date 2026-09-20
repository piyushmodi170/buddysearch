import assert from 'node:assert/strict';
import { AEO_ARTICLES, AEO_BY_SLUG, aeoPath } from './aeo.js';
import { isIndexablePath, llmsTxt, pageMetadata } from './seo.js';

function sentences(text: string) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

assert.ok(AEO_ARTICLES.length >= 5);
assert.equal(AEO_ARTICLES.length, Object.keys(AEO_BY_SLUG).length);

for (const article of AEO_ARTICLES) {
  const n = sentences(article.directAnswer).length;
  assert.ok(n >= 1 && n <= 3, `${article.slug} direct answer should be 1–3 sentences, got ${n}`);
  assert.ok(article.steps.length >= 3, article.slug);
  assert.ok(article.faqs.length >= 2, article.slug);
  for (const faq of article.faqs) {
    assert.ok(faq.q.endsWith('?'), faq.q);
    assert.ok(faq.a.length > 20, faq.q);
  }
  const path = aeoPath(article.slug);
  assert.equal(isIndexablePath(path), true, path);
  const meta = pageMetadata(path);
  assert.equal((meta.robots as { index?: boolean }).index, true, path);
}

assert.ok(AEO_BY_SLUG['what-is-buddy-search']);
assert.equal(AEO_BY_SLUG['what-is-buddy-search'].query, 'What is Buddy Search?');
assert.ok(llmsTxt().includes('/answers/hire-a-buddy'));
assert.ok(llmsTxt().includes('Where can I hire a movie buddy'));

console.log(`aeo tests passed (${AEO_ARTICLES.length} articles)`);
