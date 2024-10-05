import React from 'react';

// Definimos las propiedades que recibirá el botón (texto, tipo, estilo, etc.)
function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 font-semibold ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
