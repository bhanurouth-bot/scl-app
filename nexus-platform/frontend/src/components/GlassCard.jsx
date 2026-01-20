import React from 'react';

// We add ...props here so it captures onClick, onMouseEnter, etc.
const GlassCard = ({ children, className = "", ...props }) => {
  return (
    <div 
      className={`
        bg-glass-100 
        backdrop-blur-md 
        border border-glass-border 
        rounded-xl 
        shadow-lg 
        ${className}
      `}
      {...props} // <--- This is the magic line. It attaches the click handler to the div.
    >
      {children}
    </div>
  );
};

export default GlassCard;