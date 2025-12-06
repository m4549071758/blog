import React from 'react';
import { Link } from './Link';

type Props = React.ComponentPropsWithoutRef<typeof Link> & {
  condition: boolean;
};

export const ConditionalLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  Props
>(({ children, href, condition, ...props }, forwardedRef) => (
  <>
    {condition ? (
      <Link href={href} {...props} ref={forwardedRef}>
        {children}
      </Link>
    ) : (
      <>{children}</>
    )}
  </>
));

ConditionalLink.displayName = 'ConditionalLink';
