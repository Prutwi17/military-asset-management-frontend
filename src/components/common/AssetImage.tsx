import React, { useState } from 'react';
import { Shield, ImageOff } from 'lucide-react';

interface AssetImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIconSize?: number;
  showPlaceholderText?: boolean;
}

export const AssetImage: React.FC<AssetImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackIconSize = 20,
  showPlaceholderText = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // If no source or error occurred loading image, show neutral military equipment placeholder
  if (!src || hasError) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 text-slate-400 flex flex-col items-center justify-center select-none ${className}`}
        title="No image available"
      >
        <Shield
          style={{ width: fallbackIconSize, height: fallbackIconSize }}
          className="text-slate-400 shrink-0"
        />
        {showPlaceholderText && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-1">
            No image available
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
