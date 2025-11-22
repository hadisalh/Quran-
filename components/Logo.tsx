import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
      fill="none"
      aria-label="شعار آية ترشدك"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Background Geometric Shape (Rotated Square/Rhombus) */}
      <rect 
        x="20" 
        y="20" 
        width="60" 
        height="60" 
        rx="10" 
        transform="rotate(45 50 50)" 
        fill="url(#logoGradient)" 
        fillOpacity="0.15" 
        stroke="url(#logoGradient)" 
        strokeWidth="1.5"
      />
      
      {/* Inner Decorative Outline */}
      <rect 
        x="25" 
        y="25" 
        width="50" 
        height="50" 
        rx="8" 
        transform="rotate(45 50 50)" 
        stroke="url(#logoGradient)" 
        strokeWidth="0.5"
        strokeDasharray="4 2"
        opacity="0.6"
      />

      {/* Open Book (Quran) Symbol */}
      <g transform="translate(0, 5)">
        <path 
          d="M32 40 C32 40 45 45 50 42 C55 45 68 40 68 40 V65 C68 65 55 70 50 67 C45 70 32 65 32 65 V40 Z" 
          fill="url(#logoGradient)" 
          filter="url(#glow)"
        />
        {/* Book Spine/Center Line */}
        <path d="M50 42 V67" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/>
        {/* Pages Detail */}
        <path d="M35 44 C35 44 45 47 48 45" stroke="#0f172a" strokeWidth="0.5" strokeOpacity="0.3"/>
        <path d="M65 44 C65 44 55 47 52 45" stroke="#0f172a" strokeWidth="0.5" strokeOpacity="0.3"/>
      </g>
      
      {/* Light/Guidance Source Above */}
      <circle cx="50" cy="22" r="3" fill="url(#logoGradient)" filter="url(#glow)" />
      <path d="M50 28 V32" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <path d="M42 24 L45 27" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <path d="M58 24 L55 27" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
};