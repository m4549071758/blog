import { Image } from '@/components/common/Image';
import { Link } from '@/components/common/Link';
import { getOwnerProfile } from '@/lib/userProfile';
import { SiGithub, SiQiita, SiZenn } from 'react-icons/si';
import { FaTwitter } from 'react-icons/fa';

export const Profile = async () => {
  const profile = await getOwnerProfile();

  if (!profile) {
    return null; // Or render skeleton
  }

  return (
    <div className="select-none vstack items-center gap-5 p-6 bg-primary-1">
      <div className="vstack items-center gap-2">
        <Image
          className="object-cover w-28 h-28 rounded-full"
          alt="avatar"
          src="/assets/author.webp" // This could also be dynamic if we added avatar_url
        />
        <h1 className="text-2xl font-semibold text-primary-1">かとり</h1>
      </div>

      {profile.bio.split('\n').map((line, i) => (
        <p key={i} className="text-primary-1 min-h-[1.5em]">
          {line}
        </p>
      ))}

      <div className="hidden lg:flex gap-4">
        {profile.qiita_url && (
          <Link href={profile.qiita_url} className="text-primary-1" aria-label="Qiita">
            <SiQiita size={20} />
          </Link>
        )}
        {profile.github_url && (
           <Link href={profile.github_url} className="text-primary-1" aria-label="GitHub">
            <SiGithub size={20} />
          </Link>
        )}
        {profile.zenn_url && (
           <Link href={profile.zenn_url} className="text-primary-1" aria-label="Zenn">
            <SiZenn size={20} />
          </Link>
        )}
        {profile.twitter_url && (
           <Link href={profile.twitter_url} className="text-primary-1" aria-label="Twitter">
            <FaTwitter size={20} />
          </Link>
        )}
      </div>
    </div>
  );
};
