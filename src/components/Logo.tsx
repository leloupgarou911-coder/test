import React, { useState } from 'react';
import logoImg from '../assets/images/nameforge_logo_1791967308354.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* NameForge Brand Mark Icon with forge pulse animation */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 animate-forge-pulse flex items-center justify-center transition-all duration-300 hover:scale-105 shrink-0`}
      >
        <div className="w-full h-full rounded-[10px] bg-[#0c1020] flex items-center justify-center overflow-hidden relative">
          {!imgError ? (
            <img
              src={logoImg}
              alt="NameForge Logo"
              className="w-full h-full object-cover object-center"
              onError={() => setImgError(true)}
              loading="eager"
            />
          ) : (
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4/5 h-4/5 relative z-10 drop-shadow-md"
            >
              {/* Forge Anvil Base */}
              <path
                d="M7 21C7 20.4477 7.44772 20 8 20H24C24.5523 20 25 20.4477 25 21V23C25 23.5523 24.5523 24 24 24H8C7.44772 24 7 23.5523 7 23V21Z"
                fill="url(#anvil-base-grad)"
              />
              {/* Anvil Horn and Body */}
              <path
                d="M5 14C5 12.8954 5.89543 12 7 12H23C24.6569 12 26 13.3431 26 15V17C26 17.5523 25.5523 18 25 18H7C5.89543 18 5 17.1046 5 16V14Z"
                fill="url(#anvil-body-grad)"
              />
              <path d="M12 18L10 20H22L20 18H12Z" fill="#4338ca" />
              {/* Electric Spark / Lightning Strike from Forge */}
              <path
                d="M17 5L11 14H16L15 21L22 11H17L19 5H17Z"
                fill="url(#spark-grad)"
                className="animate-pulse"
              />
              <circle cx="16" cy="13" r="1.5" fill="#ffffff" />

              <defs>
                <linearGradient id="anvil-base-grad" x1="7" y1="22" x2="25" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="anvil-body-grad" x1="5" y1="15" x2="26" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a855f7" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="spark-grad" x1="11" y1="5" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="0.3" stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>
      </div>

      {/* Typography Wordmark */}
      {showText && (
        <span className={`${textSizes[size]} tracking-tight leading-none text-slate-900 dark:text-slate-100 flex items-center`}>
          Name
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Forge
          </span>
        </span>
      )}
    </div>
  );
};
export default Logo;
