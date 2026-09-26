'use client';

import {
  FacebookIcon,
  FacebookShareButton,
  PinterestIcon,
  PinterestShareButton,
  LineIcon,
  LineShareButton,
  HatenaIcon,
  HatenaShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';
import { MdShare } from 'react-icons/md';
import { SITE_NAME } from '@/config/app';
import { PostType } from '@/types/post';

type Props = {
  post: PostType;
};

const SIZE = 40;

export const Share: React.VFC<Props> = ({ post }) => {
  const { title, slug, ogImage } = post;

  const url = `https://www.katori.dev/posts/${slug}`;
  const config = { title, url };

  const tags = post.tags.map((tag) => tag.split(' ')[0]);

  return (
    <div className="select-none vstack gap-3 p-6 bg-primary-1">
      <div className="center gap-2 py-2 px-3 text-lg font-bold text-primary-1 uppercase">
        <MdShare aria-hidden="true" />
        share
      </div>

      <div className="w-full center gap-4">
        <PinterestShareButton {...config} media={ogImage.url} aria-label="Pinterestでシェア">
          <PinterestIcon size={SIZE} round />
        </PinterestShareButton>
        <TwitterShareButton
          title={title}
          url={url}
          via={SITE_NAME}
          related={[SITE_NAME, 'Next.js']}
          hashtags={tags}
          aria-label="Xでシェア"
        >
          <TwitterIcon size={SIZE} round />
        </TwitterShareButton>
        <FacebookShareButton {...config} aria-label="Facebookでシェア">
          <FacebookIcon size={SIZE} round />
        </FacebookShareButton>
        <LineShareButton {...config} aria-label="LINEでシェア">
          <LineIcon size={SIZE} round />
        </LineShareButton>
        <HatenaShareButton {...config} aria-label="はてなブックマークでシェア">
          <HatenaIcon size={SIZE} round />
        </HatenaShareButton>
      </div>
    </div>
  );
};
