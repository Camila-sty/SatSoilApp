import React from 'react';

// Componente del botón con color personalizado y redondeo
function Button({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-[#52B788] text-white rounded-full hover:bg-[#40916C] transition duration-300 font-semibold ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
