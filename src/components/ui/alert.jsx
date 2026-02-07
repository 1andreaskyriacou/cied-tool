import React from 'react';

export const Alert = ({ className = '', children, ...props }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const AlertDescription = ({ className = '', children, ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);