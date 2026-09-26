import React from 'react';

export interface VedicCornerFlourishProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}

/**
 * VedicCornerFlourish:
 * Traditional ornate red corner flourish (कुने बुट्टा) matching classical Vedic and Nepali sacred documents.
 */
export const VedicCornerFlourish: React.FC<VedicCornerFlourishProps> = ({
  position,
  className = '',
  size = 36,
}) => {
  const isRight = position.includes('right');
  const isBottom = position.includes('bottom');

  return (
    <div
      className={`absolute pointer-events-none select-none ${
        position === 'top-left'
          ? 'top-0.5 left-0.5'
          : position === 'top-right'
          ? 'top-0.5 right-0.5'
          : position === 'bottom-left'
          ? 'bottom-0.5 left-0.5'
          : 'bottom-0.5 right-0.5'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        style={{
          transform: `scale(${isRight ? -1 : 1}, ${isBottom ? -1 : 1})`,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer border brackets */}
        <path d="M 2 2 L 38 2 M 2 2 L 2 38" stroke="#B91C1C" strokeWidth="2" strokeLinecap="square" />
        <path d="M 5 5 L 26 5 M 5 5 L 5 26" stroke="#DC2626" strokeWidth="1" strokeLinecap="square" opacity="0.85" />

        {/* Traditional Geometric Knotwork & Floral Scrollwork (कुने बुट्टा) */}
        <path
          d="M 6 6 L 16 6 C 16 10 13 13 13 13 C 13 13 10 16 6 16 Z"
          fill="#FEE2E2"
          stroke="#B91C1C"
          strokeWidth="1.2"
        />
        <circle cx="10" cy="10" r="1.8" fill="#B91C1C" />

        {/* Outer Filigree Loops */}
        <path
          d="M 16 6 C 22 6 26 10 26 15 C 26 19 23 21 20 21 C 17 21 15 18 15 15 C 15 11 18 8 22 8"
          stroke="#B91C1C"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 6 16 C 6 22 10 26 15 26 C 19 26 21 23 21 20 C 21 17 18 15 15 15 C 11 15 8 18 8 22"
          stroke="#B91C1C"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ornate End Nodes */}
        <circle cx="28" cy="8" r="1.4" fill="#B91C1C" />
        <circle cx="8" cy="28" r="1.4" fill="#B91C1C" />
        <path d="M 27 5 Q 32 5 35 8" stroke="#B91C1C" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 5 27 Q 5 32 8 35" stroke="#B91C1C" strokeWidth="1" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};
