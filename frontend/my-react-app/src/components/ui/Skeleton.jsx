import React from 'react';

const Skeleton = ({ 
  variant = "text", 
  width, 
  height, 
  className = "" 
}) => {
  const baseClasses = "animate-pulse bg-slate-200 rounded";
  
  const variantClasses = {
    text: "h-3 w-full my-2",
    circular: "rounded-full",
    rectangular: "rounded-xl"
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
