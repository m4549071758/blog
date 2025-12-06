import { MainLayout } from '@/components/features/app/Layout';

type Props = {
  profile: React.ReactNode;
};

export const About: React.VFC<Props> = ({ profile }) => (
  <MainLayout className="lg:block" main={profile} />
);
