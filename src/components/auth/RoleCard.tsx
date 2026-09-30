import React from 'react';
import { Role } from '../../types';

interface RoleCardProps {
  role: Role;
  title: string;
  subtitle?: string;
  icon: 'admin' | 'commander' | 'logistics';
  isSelected?: boolean;
  onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  title,
  icon,
  isSelected,
  onClick,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'admin':
        return (
          <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradAdmin" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" />
                <stop offset="0.5" stopColor="#eab308" />
                <stop offset="1" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Outer Shield */}
            <path
              d="M20 3L6 8V18C6 26.5 12 34.5 20 37C28 34.5 34 26.5 34 18V8L20 3Z"
              fill="url(#goldGradAdmin)"
              opacity="0.15"
            />
            <path
              d="M20 3L6 8V18C6 26.5 12 34.5 20 37C28 34.5 34 26.5 34 18V8L20 3Z"
              stroke="url(#goldGradAdmin)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Star */}
            <polygon
              points="20,11 22.5,16.5 28.5,17 24,21 25.5,27 20,23.5 14.5,27 16,21 11.5,17 17.5,16.5"
              fill="url(#goldGradAdmin)"
            />
          </svg>
        );

      case 'commander':
        return (
          <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradCmd" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" />
                <stop offset="0.5" stopColor="#eab308" />
                <stop offset="1" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Top Star */}
            <polygon
              points="20,4 22,9 27,9.5 23,13 24.5,18 20,15 15.5,18 17,13 13,9.5 18,9"
              fill="url(#goldGradCmd)"
            />
            {/* Chevrons */}
            <path
              d="M11 20L20 26L29 20"
              stroke="url(#goldGradCmd)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 26L20 32L29 26"
              stroke="url(#goldGradCmd)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 32L20 37L27 32"
              stroke="url(#goldGradCmd)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </svg>
        );

      case 'logistics':
        return (
          <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradLogTop" x1="0" y1="0" x2="40" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" />
                <stop offset="1" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="goldGradLogLeft" x1="0" y1="20" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#eab308" />
                <stop offset="1" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="goldGradLogRight" x1="20" y1="20" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ca8a04" />
                <stop offset="1" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Top Face */}
            <polygon
              points="20,6 34,13 20,20 6,13"
              fill="url(#goldGradLogTop)"
              stroke="#fef08a"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Left Face */}
            <polygon
              points="6,13 20,20 20,35 6,28"
              fill="url(#goldGradLogLeft)"
              stroke="#eab308"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Right Face */}
            <polygon
              points="20,20 34,13 34,28 20,35"
              fill="url(#goldGradLogRight)"
              stroke="#ca8a04"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Center seam line */}
            <line x1="20" y1="20" x2="20" y2="35" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl transition-all duration-200 cursor-pointer text-center w-full aspect-square focus:outline-none ${
        isSelected
          ? 'bg-[#0d213a]/90 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] ring-1 ring-cyan-400/50'
          : 'bg-[#0b1626]/85 hover:bg-[#0d213a]/80 border border-slate-700/80 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]'
      }`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        {renderIcon()}
      </div>

      {/* Role Title */}
      <span className="text-xs sm:text-sm font-medium text-white tracking-wide mt-2.5 group-hover:text-cyan-200 transition-colors">
        {title}
      </span>
    </button>
  );
};
