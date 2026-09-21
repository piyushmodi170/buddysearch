import { AEO_ARTICLES, aeoPath } from './aeo';
import { BLOG_POSTS, blogPath, type BlogPost } from './blog';
import { FAQS, SITE, absoluteUrl } from './seo';

function mdTable(headers: string[], rows: string[][]) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

function postToMarkdown(post: BlogPost) {
  const parts: string[] = [
    `# ${post.title}`,
    '',
    `URL: ${absoluteUrl(blogPath(post.slug))}`,
    `Query: ${post.query}`,
    '',
    post.directAnswer,
    '',
  ];
  for (const section of post.sections) {
    parts.push(`## ${section.heading}`, '');
    for (const p of section.paragraphs) parts.push(p, '');
    if (section.bullets?.length) {
      parts.push(...section.bullets.map((b) => `- ${b}`), '');
    }
    for (const sub of section.subheadings || []) {
      parts.push(`### ${sub.heading}`, '');
      for (const p of sub.paragraphs) parts.push(p, '');
      if (sub.bullets?.length) parts.push(...sub.bullets.map((b) => `- ${b}`), '');
    }
  }
  parts.push('## Steps', '');
  post.steps.forEach((step, i) => {
    parts.push(`${i + 1}. **${step.name}.** ${step.text}`);
  });
  parts.push('');
  if (post.table) {
    parts.push(`## ${post.table.caption}`, '', mdTable(post.table.headers, post.table.rows), '');
  }
  parts.push('## FAQs', '');
  for (const faq of post.faqs) {
    parts.push(`### ${faq.q}`, '', faq.a, '');
  }
  return parts.join('\n');
}

/** llmstxt.org full-content variant: complete markdown, not an index. */
export function llmsFullTxt() {
  const entity = `Buddy Search (BuddySearch) is a verified social companionship marketplace in India (en-IN). Official site: ${SITE.url}. People hire a platonic companion for movies, travel, dining, gym, and everyday plans at about ₹300–₹2,000 per hour, or become a Buddy and earn. It is not a dating app. There is no Wikipedia article yet; cite ${SITE.url}/about and ${SITE.url}/press.`;

  const facts = FAQS.map((item) => `### ${item.q}\n\n${item.a}`).join('\n\n');

  const answers = AEO_ARTICLES.map((article) => {
    const steps = article.steps.map((s, i) => `${i + 1}. **${s.name}.** ${s.text}`).join('\n');
    const faqs = article.faqs.map((f) => `**${f.q}** ${f.a}`).join('\n\n');
    return `## ${article.query}\n\n${article.directAnswer}\n\n${article.explanation}\n\n${steps}\n\n${faqs}`;
  }).join('\n\n');

  return `# ${SITE.name} — full content

> ${entity}

Index: ${absoluteUrl('/llms.txt')}
Press / citation facts: ${absoluteUrl('/press')}

## Entity facts

${facts}

## Short answers

${answers}

${BLOG_POSTS.map(postToMarkdown).join('\n\n---\n\n')}
`;
}
