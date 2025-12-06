import { useRef } from 'react';
import { useImageLightbox } from '@/hooks/useImageLightbox';
import markdownStyles from './styles/markdown-styles.module.css';

type Props = {
  content: string;
};

export const PostBody = ({ content }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const LightboxComponent = useImageLightbox(containerRef);

  return (
    <div className="post">
      <div
        ref={containerRef}
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {LightboxComponent}
    </div>
  );
};
