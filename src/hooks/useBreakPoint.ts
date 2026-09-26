'use client';

import { useCallback, useSyncExternalStore } from 'react';

type Bp = 'sm' | 'md' | 'lg' | 'xl';

const bps = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// window.innerWidthの読み取りは強制リフローを起こすため、matchMediaで判定する。
export const useBreakPoint = (bp: Bp) => {
  const query = `(min-width: ${bps[bp]}px)`;

  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};
