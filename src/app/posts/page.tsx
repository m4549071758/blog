import PaginationPage, {
  generateMetadata as generatePageMetadata,
} from './page/[page]/page';

export function generateMetadata() {
  return generatePageMetadata({ params: Promise.resolve({ page: '1' }) });
}

export default function PostsIndex() {
  return PaginationPage({ params: Promise.resolve({ page: '1' }) });
}
