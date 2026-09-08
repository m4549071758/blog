export type PostType = {
  id?: string;
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage: {
    url: string;
  };
  content: string;
  tags: string[];
  like_count?: number;
};
