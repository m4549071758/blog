import Link from 'next/link';
import { AiOutlineHome } from 'react-icons/ai';
import { MdChevronRight } from 'react-icons/md';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
}) => {
  const breadcrumbItems = [{ label: 'ホーム', href: '/' }, ...items];

  const generateStructuredData = () => {
    const itemListElement = breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { 
        item: { 
          '@id': item.href.startsWith('http') ? item.href : `${process.env.NEXT_PUBLIC_ROOT_URL || 'https://www.katori.dev'}${item.href}` 
        } 
      }),
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />
      <nav
        aria-label="パンくずリスト"
        className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <MdChevronRight className="w-4 h-4 mx-1 text-gray-400" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <>
                    {index === 0 && <AiOutlineHome className="w-4 h-4 mr-1" />}
                    <span>{item.label}</span>
                  </>
                </Link>
              ) : (
                <span className="flex items-center text-gray-900 dark:text-gray-100">
                  {index === 0 && <AiOutlineHome className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
