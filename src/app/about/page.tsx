import { About } from '@/components/pages/about';
import { Profile } from '@/components/features/app/Profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Katori\'s blog',
  description: 'Katoriのプロフィール、このブログについて、エンジニアとしての活動内容を紹介するページです。',
  keywords: ['Katori', 'プロフィール', 'エンジニア', 'Proxmox', 'セルフホスト', 'クレー射撃'],
};

export default function AboutPage() {
  return <About profile={<Profile />} />;
}
