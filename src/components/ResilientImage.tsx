import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#ECFDF5] via-[#F8FAF7] to-[#FEF3C7] dark:from-[#0C2119] dark:via-[#0F1E17] dark:to-[#1C1A0E] text-[#047857] dark:text-[#6EE7B7] p-4 text-center ${className}`}
      >
        <ShoppingBag className="w-7 h-7 opacity-80 mb-2" strokeWidth={1.6} />
        <span className="text-xs font-medium line-clamp-2 max-w-[14rem] opacity-85">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F1F5F0] dark:bg-[#102019]">
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#E6EDE7] via-[#F4F8F4] to-[#E6EDE7] dark:from-[#102019] dark:via-[#162C22] dark:to-[#102019] animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
