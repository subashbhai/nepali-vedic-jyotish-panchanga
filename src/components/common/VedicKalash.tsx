import React, { useId } from 'react';

export interface VedicKalashProps {
  className?: string;
  size?: number;
}

/**
 * VedicKalash Component:
 * An authentic, highly detailed, and auspicious Vedic Mangal Kalash (मङ्गल कलश / पूर्णकुम्भ).
 * Featuring a golden brass pot with red Swastika, sacred Mauli/Kalava threads around the neck,
 * fresh green mango leaves (आम्रपल्लव), and an auspicious coconut with red tilak on top.
 * Uses useId() for isolated, collision-free SVG gradient defs during print/PDF generation.
 */
export const VedicKalash: React.FC<VedicKalashProps> = ({ className = '', size = 64 }) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '_');

  const goldGradId = `goldPotGrad_${id}`;
  const leafGradId = `leafGrad_${id}`;
  const leafHighlightId = `leafHighlight_${id}`;
  const coconutGradId = `coconutGrad_${id}`;
  const rimGradId = `rimGrad_${id}`;

  return (
    <div className={`inline-flex items-center justify-center shrink-0 select-none ${className}`} style={{ width: size, height: size * 1.08 }}>
      <svg
        viewBox="0 0 100 108"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich Metallic Golden Gradient */}
          <linearGradient id={goldGradId} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Golden Rim Gradient */}
          <linearGradient id={rimGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="40%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Lush Green Mango Leaf Gradient */}
          <linearGradient id={leafGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="40%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          {/* Leaf Highlight */}
          <linearGradient id={leafHighlightId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Sacred Coconut Shell Gradient */}
          <linearGradient id={coconutGradId} x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#A16207" />
            <stop offset="45%" stopColor="#713F12" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* 1. Base Stand / Pedestal (पीठिका) */}
        <ellipse cx="50" cy="99" rx="20" ry="4.5" fill="#78350F" />
        <ellipse cx="50" cy="98" rx="19" ry="4" fill={`url(#${goldGradId})`} stroke="#92400E" strokeWidth="1" />
        <path d="M 33 97 Q 50 95 67 97 L 64 100 Q 50 102 36 100 Z" fill="#B45309" />

        {/* 2. Mango Leaves (आम्रपल्लव) - Behind Coconut */}
        {/* Far Left Leaf */}
        <path d="M 38 42 C 22 34 10 24 14 11 C 24 20 33 30 42 40 Z" fill={`url(#${leafGradId})`} stroke="#14532D" strokeWidth="1.2" />
        <path d="M 23 21 Q 30 30 38 40" stroke="#86EFAC" strokeWidth="0.8" opacity="0.7" />

        {/* Far Right Leaf */}
        <path d="M 62 42 C 78 34 90 24 86 11 C 76 20 67 30 58 40 Z" fill={`url(#${leafGradId})`} stroke="#14532D" strokeWidth="1.2" />
        <path d="M 77 21 Q 70 30 62 40" stroke="#86EFAC" strokeWidth="0.8" opacity="0.7" />

        {/* Mid Left Leaf */}
        <path d="M 43 40 C 31 27 24 11 29 4 C 37 13 44 26 47 38 Z" fill={`url(#${leafGradId})`} stroke="#14532D" strokeWidth="1.2" />
        <path d="M 34 15 Q 40 26 45 38" stroke="#86EFAC" strokeWidth="0.8" opacity="0.7" />

        {/* Mid Right Leaf */}
        <path d="M 57 40 C 69 27 76 11 71 4 C 63 13 56 26 53 38 Z" fill={`url(#${leafGradId})`} stroke="#14532D" strokeWidth="1.2" />
        <path d="M 66 15 Q 60 26 55 38" stroke="#86EFAC" strokeWidth="0.8" opacity="0.7" />

        {/* Top Center Leaf */}
        <path d="M 47 38 C 46 20 44 4 50 1 C 56 4 54 20 53 38 Z" fill={`url(#${leafGradId})`} stroke="#14532D" strokeWidth="1.2" />
        <line x1="50" y1="4" x2="50" y2="38" stroke="#86EFAC" strokeWidth="1" opacity="0.8" />

        {/* 3. Auspicious Coconut (श्रीफल / नारिकेल) */}
        <ellipse cx="50" cy="30" rx="14" ry="16" fill={`url(#${coconutGradId})`} stroke="#2E1005" strokeWidth="1.4" />
        {/* Coconut Natural Fibers Texture */}
        <path d="M 44 20 Q 50 17 56 20" stroke="#B45309" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M 42 27 Q 50 24 58 27" stroke="#B45309" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M 43 35 Q 50 32 57 35" stroke="#B45309" strokeWidth="1" fill="none" opacity="0.6" />
        {/* Sacred Vermilion Tilak (रोली-चन्दन टीका) */}
        <ellipse cx="50" cy="22" rx="3.5" ry="5" fill="#DC2626" />
        <circle cx="50" cy="22" r="1.5" fill="#FEF08A" />

        {/* 4. Kalash Rim & Flared Neck */}
        {/* Neck Shadow Base */}
        <ellipse cx="50" cy="46" rx="19" ry="5" fill="#78350F" />
        {/* Outer Flared Lip */}
        <ellipse cx="50" cy="43.5" rx="21" ry="4.5" fill={`url(#${rimGradId})`} stroke="#92400E" strokeWidth="1.5" />
        <ellipse cx="50" cy="43.5" rx="17" ry="3" fill="#D97706" />

        {/* 5. Sacred Thread (मौली / कलावा / रक्षासूत्र) around Neck */}
        <rect x="33" y="47" width="34" height="4.5" rx="2" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
        <line x1="37" y1="47" x2="37" y2="51.5" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="43" y1="47" x2="43" y2="51.5" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="50" y1="47" x2="50" y2="51.5" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="57" y1="47" x2="57" y2="51.5" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="63" y1="47" x2="63" y2="51.5" stroke="#FDE047" strokeWidth="1.5" />

        {/* 6. Main Golden Pot Body (कुम्भ) */}
        <path
          d="M 33 49 C 13 55 11 86 35 97 C 45 101 55 101 65 97 C 89 86 87 55 67 49 Z"
          fill={`url(#${goldGradId})`}
          stroke="#78350F"
          strokeWidth="2"
        />

        {/* 7. Golden 3D Metallic Highlights */}
        <path
          d="M 27 58 C 21 67 21 79 28 87"
          stroke="#FEF08A"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M 31 55 C 27 61 27 70 31 77"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* 8. Auspicious Red Swastika (卐) on Pot Center with 4 Auspicious Dots */}
        <g transform="translate(50, 74) scale(0.9)">
          {/* Red Swastika Lines */}
          <line x1="0" y1="-11" x2="0" y2="11" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="square" />
          <line x1="-11" y1="0" x2="11" y2="0" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="square" />
          <line x1="0" y1="-11" x2="7.5" y2="-11" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="square" />
          <line x1="11" y1="0" x2="11" y2="7.5" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="square" />
          <line x1="0" y1="11" x2="-7.5" y2="11" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="square" />
          <line x1="-11" y1="0" x2="-11" y2="-7.5" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="square" />
          {/* 4 Divine Dots */}
          <circle cx="5" cy="-5" r="1.4" fill="#B91C1C" />
          <circle cx="5" cy="5" r="1.4" fill="#B91C1C" />
          <circle cx="-5" cy="5" r="1.4" fill="#B91C1C" />
          <circle cx="-5" cy="-5" r="1.4" fill="#B91C1C" />
        </g>
      </svg>
    </div>
  );
};
