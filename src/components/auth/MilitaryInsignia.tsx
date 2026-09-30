import React from 'react';

interface MilitaryInsigniaProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const MilitaryInsignia: React.FC<MilitaryInsigniaProps> = ({
  size = 'md',
  withText = false,
  className = '',
  lightText = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Insignia SVG */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
        >
          {/* Outer Wings / Chevron left */}
          <path
            d="M 12 36 L 36 48 L 30 54 L 14 46 Z"
            fill="url(#wingGradient)"
            opacity="0.85"
          />
          <path
            d="M 6 48 L 32 60 L 26 66 L 8 58 Z"
            fill="url(#wingGradient)"
            opacity="0.65"
          />

          {/* Outer Wings / Chevron right */}
          <path
            d="M 88 36 L 64 48 L 70 54 L 86 46 Z"
            fill="url(#wingGradient)"
            opacity="0.85"
          />
          <path
            d="M 94 48 L 68 60 L 74 66 L 92 58 Z"
            fill="url(#wingGradient)"
            opacity="0.65"
          />

          {/* Center 5-Point Military Star */}
          <polygon
            points="50,16 58,35 78,35 62,48 68,68 50,54 32,68 38,48 22,35 42,35"
            fill="url(#starGradient)"
            stroke="#93c5fd"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Core Chevron */}
          <path
            d="M 40 76 L 50 68 L 60 76 L 50 84 Z"
            fill="#38bdf8"
          />

          <defs>
            <linearGradient id="starGradient" x1="20" y1="15" x2="80" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#93c5fd" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="wingGradient" x1="0" y1="30" x2="100" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60a5fa" />
              <stop offset="1" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text matching Screen 1 */}
      {withText && (
        <div className="mt-2.5 space-y-0.5">
          <h1 className="font-extrabold tracking-[0.14em] uppercase text-lg sm:text-xl md:text-2xl text-white leading-tight">
            Military Asset
          </h1>
          <h2 className="font-extrabold tracking-[0.14em] uppercase text-lg sm:text-xl md:text-2xl text-white leading-tight">
            Management System
          </h2>
          <p className="text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-slate-300/85 pt-0.5 font-medium">
            SECURE &bull; TRACK &bull; MAINTAIN &bull; DEPLOY
          </p>
        </div>
      )}
    </div>
  );
};
