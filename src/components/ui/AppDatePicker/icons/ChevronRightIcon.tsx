import React from 'react';

interface ChevronRightIconProps {
  color?: string;
  size?: number;
}

export const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ 
  color = '#302F2D', 
  size = 20 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M7.5 15L12.5 10L7.5 5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
