export type BlogFaq = { q: string; a: string };

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  subheadings?: { heading: string; paragraphs: string[]; bullets?: string[] }[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  category: string;
  query: string;
  directAnswer: string;
  sections: BlogSection[];
  steps: { name: string; text: string }[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  faqs: BlogFaq[];
  related: string[];
};

export const blogPath = (slug: string) => `/blog/${slug}`;
