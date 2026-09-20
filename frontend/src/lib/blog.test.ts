import assert from 'node:assert/strict';
import { BLOG_BY_SLUG, BLOG_POSTS, blogPath } from './blog.js';
import { isIndexablePath, llmsTxt, pageMetadata } from './seo.js';

assert.ok(BLOG_POSTS.length >= 18, `expected 18+ posts, got ${BLOG_POSTS.length}`);
assert.equal(BLOG_POSTS.length, new Set(BLOG_POSTS.map((p) => p.slug)).size);

for (const post of BLOG_POSTS) {
  assert.ok(post.directAnswer.includes('.'), post.slug);
  assert.ok(post.sections.length >= 2, post.slug);
  assert.ok(post.steps.length >= 3, post.slug);
  assert.ok(post.faqs.length >= 3, post.slug);
  assert.equal(isIndexablePath(blogPath(post.slug)), true, post.slug);
  assert.equal((pageMetadata(blogPath(post.slug)).robots as { index?: boolean }).index, true);
  for (const slug of post.related) {
    assert.ok(BLOG_BY_SLUG[slug], `${post.slug} related missing ${slug}`);
  }
}

assert.ok(llmsTxt().includes('/blog'));
assert.ok(llmsTxt().includes('hire-a-buddy-in-india-complete-guide'));

console.log(`blog tests passed (${BLOG_POSTS.length} posts)`);
