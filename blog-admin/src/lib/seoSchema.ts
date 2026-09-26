import { BlogPost } from '@/types';
import { SITE_CONFIG } from '@/config/site';

/**
 * Generate Schema.org BlogPosting JSON-LD
 */
export function generateBlogPostingSchema(post: BlogPost) {
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const imageUrl = post.cover_image || `${SITE_CONFIG.url}/images/og-default.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: post.author || `${SITE_CONFIG.name} Sports Desk`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/fairplay-logo.png`,
      },
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    articleSection: post.category,
    keywords: (post.tags || []).join(', '),
  };
}

/**
 * Extract FAQ pairs and generate Schema.org FAQPage JSON-LD
 */
export function generateFaqSchema(content: string[] | string) {
  const paragraphs = Array.isArray(content)
    ? content
    : content.split(/\n\n+/).filter(Boolean);

  const faqs: { question: string; answer: string }[] = [];

  paragraphs.forEach((p) => {
    // Check for FAQ pattern: **Q: ...?** \n A: ... or ### FAQ: ...
    const faqMatch = p.match(/(?:\*\*Q:\s*|\bQ:\s*|###\s*FAQ:\s*)([^\n?*]+(?:\?|\b))\*?\*?\s*(?:\n+)?(?:\*\*A:\s*|\bA:\s*)([\s\S]+)/i);
    if (faqMatch) {
      faqs.push({
        question: faqMatch[1].trim(),
        answer: faqMatch[2].trim(),
      });
    }
  });

  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(postTitle: string, postSlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_CONFIG.url}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: postTitle,
        item: `${SITE_CONFIG.url}/blog/${postSlug}`,
      },
    ],
  };
}
