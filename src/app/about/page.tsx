import { About } from '@/components/pages/about';
import { Profile } from '@/components/features/app/Profile';
import { createPageMetadata } from '@/lib/metadata';

export function generateMetadata() {
  return createPageMetadata(
    'プロフィール',
    'Katoriのプロフィール、このブログについて、エンジニアとしての活動内容を紹介するページです。',
    '/about/',
  );
}

export default function AboutPage() {
  return <About profile={<Profile />} />;
}
