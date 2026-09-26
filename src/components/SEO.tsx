import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogType?: string;
  image?: string;
  robots?: string;
  structuredData?: object;
}

const SITE_URL = SITE_CONFIG.siteUrl;
const SITE_NAME = SITE_CONFIG.name;

export default function SEO({
  title,
  description,
  canonical,
  keywords,
  ogType = 'website',
  image,
  robots,
  structuredData,
}: SEOProps) {
  let fullCanonical = '';
  if (canonical) {
    const cleanCanonical = canonical.startsWith('/') ? canonical : `/${canonical}`;
    fullCanonical = `${SITE_URL}${cleanCanonical}`;
  }

  // Prevent double-branding or over-length truncation
  const hasBrand = title.toLowerCase().includes('fairplay');
  const fullTitle = hasBrand ? title : `${title} | ${SITE_NAME}`;

  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
    : `${SITE_URL}/images/logo.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {robots && <meta name="robots" content={robots} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
