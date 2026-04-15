import React from 'react';

const variants = {

  primary: "btn-glow",

  secondary:
    "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg",

  success:
    "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg",

  danger:
    "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg",

  warning:
    "bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg",

  outline:
    "border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-lg"

};

function Button({ children, variant = "primary", className = "", ...props }) {

  return (
    <button
      className={`transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
