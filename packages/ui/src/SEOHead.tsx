export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export interface SEOHeadProps {
  seo: SEOData;
}

export function SEOHead({ seo }: SEOHeadProps) {
  return (
    <>
      <title>{seo.title}</title>
      <meta name='description' content={seo.description} />

      {seo.keywords && <meta name='keywords' content={seo.keywords} />}

      {/* Open Graph tags */}
      <meta property='og:title' content={seo.title} />
      <meta property='og:description' content={seo.description} />
      <meta property='og:type' content={seo.type || 'website'} />

      {seo.url && <meta property='og:url' content={seo.url} />}
      {seo.image && <meta property='og:image' content={seo.image} />}

      {/* Twitter tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={seo.title} />
      <meta name='twitter:description' content={seo.description} />
      {seo.image && <meta name='twitter:image' content={seo.image} />}
    </>
  );
}
