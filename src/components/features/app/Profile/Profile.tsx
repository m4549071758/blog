import { Image } from '@/components/common/Image';
import { Link } from '@/components/common/Link';
import { sns } from '@/config/sns';

export const Profile = () => (
  <div className="select-none vstack items-center gap-5 p-6 bg-primary-1">
    <div className="vstack items-center gap-2">
      <Image
        className="object-cover w-28 h-28 rounded-full"
        alt="avatar"
        src="/assets/author.webp"
      />
      <h1 className="text-2xl font-semibold text-primary-1">かとり</h1>
    </div>

    <p className="text-primary-1">
      自宅サーバーにProxmoxを入れて、クラスタ組んで遊んでいます。
    </p>
    <p className="text-primary-1">
      山とか登ったり、自転車乗ったり、スキーしたりしてます。
    </p>
    <p className="text-primary-1">
      技術スタック: Golang, Python, Next.js, Proxmox, Linux, Java, サーバー
    </p>

    <div className="flex gap-4">
      {sns.map(({ href, icon, label }) => (
        <Link key={href} href={href} passHref>
          <a className="text-primary-1" aria-label={label}>
            {icon}
          </a>
        </Link>
      ))}
    </div>
  </div>
);
