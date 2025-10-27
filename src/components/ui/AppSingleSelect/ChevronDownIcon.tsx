import React from 'react';

interface ChevronDownIconProps {
  color?: string;
  size?: number;
  className?: string;
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
  color = '#B2B1AE',
  size = 20,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
