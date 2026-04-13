'use client';

import { ImgHTMLAttributes, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { PLACEHOLDER_STORY_IMAGE } from '@/lib/storyImage';

type FallbackImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function FallbackImage({ src, fallbackSrc = PLACEHOLDER_STORY_IMAGE, onError, ...props }: FallbackImageProps) {
  const normalizedSource = useMemo(() => {
    const value = String(src || '').trim();
    return value || fallbackSrc;
  }, [src, fallbackSrc]);
  const [currentSrc, setCurrentSrc] = useState(normalizedSource);

  useEffect(() => {
    setCurrentSrc(normalizedSource);
  }, [normalizedSource]);

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.(event);
  };

  return <img {...props} src={currentSrc} onError={handleError} />;
}
