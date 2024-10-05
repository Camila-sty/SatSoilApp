import React, { useEffect, useState } from 'react';

function App() {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Aquí iría la lógica para obtener el mensaje desde el backend
    setMensaje('¡Hola SatSoil Team!');
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold underline text-blue-600">
        {mensaje}
      </h1>
    </div>
  );
}

export default App;
