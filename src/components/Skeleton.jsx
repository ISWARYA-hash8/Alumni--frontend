import React from 'react';

function Skeleton({ className = 'h-4 bg-gray-200 rounded', ...props }) {
  return <div className={`animate-pulse ${className}`} {...props} />;
}

export default Skeleton;