import NextLink, { LinkProps } from 'next/link';
import { ComponentProps } from 'react';

type Props = LinkProps & ComponentProps<'a'>;

export const Link = ({ children, ...props }: Props) => {
  return <NextLink {...props}>{children}</NextLink>;
};
