export interface PageLink {
  text: string;
  url: string;
}

export interface PageSection {
  heading: string;
  paragraphs: string[];
  subsections?: { heading: string; paragraphs: string[] }[];
}

export interface PageData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  keywords: string;
  ogType: string;
  category: string;
  breadcrumb: { name: string; url: string }[];
  intro: string;
  sections: PageSection[];
  relatedLinks: PageLink[];
  structuredData?: object;
  faqs?: { question: string; answer: string }[];
}
