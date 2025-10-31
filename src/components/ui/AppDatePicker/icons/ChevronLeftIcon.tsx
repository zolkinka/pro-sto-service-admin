import React from 'react';

interface ChevronLeftIconProps {
  color?: string;
  size?: number;
}

export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({ 
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
        d="M12.5 15L7.5 10L12.5 5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
