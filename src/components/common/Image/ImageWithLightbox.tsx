import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Image as BaseImage } from './Image';
import type React from 'react';

type ImageWithLightboxProps = React.ComponentPropsWithoutRef<typeof BaseImage> & {
  disableLightbox?: boolean;
};

export const ImageWithLightbox = ({
  src,
  alt,
  disableLightbox = false,
  className = '',
  ...props
}: ImageWithLightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (disableLightbox) {
    return <BaseImage src={src} alt={alt} className={className} {...props} />;
  }

  return (
    <>
      <BaseImage
        src={src}
        alt={alt}
        className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setIsOpen(true)}
        {...props}
      />
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src: src || '' }]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </>
  );
};
