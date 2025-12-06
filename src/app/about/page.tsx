import { About } from '@/components/pages/about';
import { Profile } from '@/components/features/app/Profile';

export default function AboutPage() {
  return <About profile={<Profile />} />;
}
