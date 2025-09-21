import type { Post, SiteSettings } from "./payloadClient";

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function generateSEO(
  data: Post | SiteSettings,
  siteSettings: SiteSettings,
  type: "post" | "home" = "home"
): SEOData {
  const baseTitle = siteSettings.title;
  const baseDescription = siteSettings.description;

  let title = baseTitle;
  let description = baseDescription;
  let keywords: string | undefined;
  let image: string | undefined;

  if (type === "post" && "title" in data) {
    const post = data as Post;
    title = post.seo?.title || `${post.title} | ${baseTitle}`;
    description = post.seo?.description || post.excerpt || baseDescription;
    keywords = post.seo?.keywords;
    image = post.seo?.image?.url || post.featuredImage?.url;
  }

  return {
    title,
    description,
    keywords,
    image,
    type: type === "home" ? "website" : "article",
  };
}

export function generateMetaTags(seo: SEOData): string {
  const tags = [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${seo.description}" />`,
  ];

  if (seo.keywords) {
    tags.push(`<meta name="keywords" content="${seo.keywords}" />`);
  }

  // Open Graph tags
  tags.push(
    `<meta property="og:title" content="${seo.title}" />`,
    `<meta property="og:description" content="${seo.description}" />`,
    `<meta property="og:type" content="${seo.type || "website"}" />`
  );

  if (seo.url) {
    tags.push(`<meta property="og:url" content="${seo.url}" />`);
  }

  if (seo.image) {
    tags.push(
      `<meta property="og:image" content="${seo.image}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:image" content="${seo.image}" />`
    );
  }

  // Twitter tags
  tags.push(
    `<meta name="twitter:title" content="${seo.title}" />`,
    `<meta name="twitter:description" content="${seo.description}" />`
  );

  return tags.join("\n    ");
}
