import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
  wrapperClassName?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FDE8EF] via-[#FCF8F4] to-[#F3EDF8] text-[#6B1D3A] p-4 text-center ${wrapperClassName} ${className}`}
      >
        <Sparkles className="w-7 h-7 text-[#C69C53] mb-2" strokeWidth={1.5} />
        <span className="font-display text-sm font-medium text-[#6B1D3A] line-clamp-2 max-w-[14rem]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
};
