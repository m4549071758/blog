'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PostsIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/posts/page/1');
  }, [router]);

  return null;
}
