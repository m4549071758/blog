interface ArticleStructuredDataProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName: string;
  publisherLogoUrl: string;
  url: string;
  imageUrl: string;
  tags?: string[];
}

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherName,
  publisherLogoUrl,
  url,
  imageUrl,
  tags = [],
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
    },
    keywords: tags.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

interface WebsiteStructuredDataProps {
  name: string;
  url: string;
  description: string;
}

export const WebsiteStructuredData: React.FC<WebsiteStructuredDataProps> = ({
  name,
  url,
  description,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};
