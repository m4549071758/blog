interface ArticleStructuredDataProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
  imageUrl: string;
  tags?: string[];
}

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({
  title,
  description,
  datePublished,
  dateModified,
  author,
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
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: "Katori's blog",
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_ROOT_URL}/assets/author.webp`,
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
