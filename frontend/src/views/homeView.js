import React from 'react';

function HomeView() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      {/* Imagen de fondo */}
      <div className="relative flex flex-col items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url('/images/landingImage.png')` }}>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div> {/* Capa semitransparente */}

        {/* Logos en la parte superior centrados */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-row items-center space-y-4">
          <img src="/images/nasaSpaceLogo.png" alt="NASA Space Apps" className="w-40" />
          <img src="/images/satSoilLogoBlanco.png" alt="SatSoil Logo" className="w-64" />
          <img src="/images/laAraucanaLogo.png" alt="La Araucana Logo" className="w-56" />
        </div>

        {/* Título y Subtítulo */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white">
          <h1 className="text-7xl font-bold mb-4">SatSoil</h1>
          <p className="text-lg italic" style={{ color: 'rgb(82, 183, 136)' }}>
            "Leveraging Earth observation data informed agricultural decision-making"
          </p>
        </div>

        {/* Información del equipo */}
        <div className="absolute bottom-0 left-0 w-full text-center p-8">
          <div className="text-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Nuestro Equipo</h2>
            <ul className="text-lg">
              <li>Carlos Madina</li>
              <li>Nicolás Ortega</li>
              <li>Luis Garrido</li>
              <li>Florencia Tillería</li>
              <li>Aimé Lobos</li>
              <li>Camila Estay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;
