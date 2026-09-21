import { BLOG_POSTS_A } from '../content/blog-posts-a';
import { BLOG_POSTS_B } from '../content/blog-posts-b';
import { BLOG_POSTS_C } from '../content/blog-posts-c';
import type { BlogPost } from './blog-types';
import { blogPath } from './blog-types';

export type { BlogPost, BlogFaq, BlogSection } from './blog-types';
export { blogPath };

export const BLOG_POSTS: BlogPost[] = [...BLOG_POSTS_A, ...BLOG_POSTS_B, ...BLOG_POSTS_C];

export const BLOG_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  BLOG_POSTS.map((post) => [post.slug, post]),
);

export function relatedPosts(post: BlogPost) {
  return post.related.map((slug) => BLOG_BY_SLUG[slug]).filter(Boolean);
}
