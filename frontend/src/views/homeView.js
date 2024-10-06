import React, { useState } from 'react';
import Button from '../components/Button'; // Ruta actualizada para el componente Button

function HomeView() {
  const [ndviMapUrl, setNdviMapUrl] = useState(null);
  const [ndreMapUrl, setNdreMapUrl] = useState(null);
  const [ndmiMapUrl, setNdmiMapUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provincia, setProvincia] = useState(''); // Cambiado a "provincia"
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  // Función para generar los mapas de NDVI, NDRE y NDMI
  const handleCalculateMaps = () => {
    if (!provincia || !startDate || !endDate) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de término');
      return;
    }

    setIsLoading(true);
    setError('');

    // Llamar ambos endpoints en paralelo (NDVI, NDRE, NDMI)
    Promise.all([
      fetch('http://localhost:5001/get-ndvi-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comuna: provincia,
          start_date: startDate,
          end_date: endDate,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Error al generar el mapa NDVI');
        }
        return response.json();
      }),
    
      fetch('http://localhost:5001/get-ndre-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comuna: provincia,
          start_date: startDate,
          end_date: endDate,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Error al generar el mapa NDRE');
        }
        return response.json();
      }),
    
      fetch('http://localhost:5001/get-ndmi-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comuna: provincia,
          start_date: startDate,
          end_date: endDate,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Error al generar el mapa NDMI');
        }
        return response.json();
      })
    ])
    .then(([ndviData, ndreData, ndmiData]) => {
      // Mostrar los tres mapas en la vista
      setNdviMapUrl(ndviData.mapUrl);
      setNdreMapUrl(ndreData.mapUrl);
      setNdmiMapUrl(ndmiData.mapUrl);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('Error al cargar los mapas:', error);
      setError('Hubo un error al generar los mapas');
      setIsLoading(false);
    });
  }    

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #1C1C1C, #333333, #666666)' }}>
      {/* Imagen de fondo e información del proyecto */}
      <div
        className="relative flex flex-col items-center justify-center h-screen bg-cover bg-center"
        style={{ backgroundImage: `url('/images/landingImage.png')` }}
      >
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
            "Uso de datos de observación de la Tierra para toma de decisiones agrícolas informada"
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

      {/* Leyenda sobre los índices espectrales */}
      <div className="relative z-20 flex flex-col items-center justify-center mt-12">
        <p className="text-xl text-center text-white max-w-4xl mx-auto p-4">
          SatSoil es una plataforma que utiliza índices espectrales como NDVI, NDRE y NDMI para monitorear la salud de tus cultivos con datos satelitales. Proporciona información clave para optimizar recursos, mejorar la productividad y tomar decisiones informadas para el cuidado de tus cultivos.
        </p>
        <h1 className="text-6xl font-bold text-white my-12">Región del Maule</h1>
      </div>

      {/* Nueva sección para seleccionar la provincia y las fechas */}
      <div className="relative z-20 flex flex-col items-center justify-center mt-6">
        <h2 className="text-2xl font-bold text-white">Ingresa datos de consulta</h2>

        <div className="flex flex-col space-y-4 my-6 w-1/6 rounded-full">
          {/* Select para elegir la provincia */}
          <select
            className="border p-2 rounded"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          >
            <option value="">Selecciona una provincia</option>
            <option value="Linares">Linares</option>
            <option value="Curico">Curicó</option>
            <option value="Talca">Talca</option>
            <option value="Cauquenes">Cauquenes</option>
          </select>

          <input
            type="date"
            placeholder="Fecha de inicio"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            placeholder="Fecha de término"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Usamos un único botón para generar ambos mapas */}
          <Button onClick={handleCalculateMaps} disabled={isLoading}>
            {isLoading ? 'Calculando mapas...' : 'Generar'}
          </Button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      {/* Sección para mostrar el mapa NDVI */}
      {ndviMapUrl && (
        <div className="relative z-20 flex flex-col items-center justify-center mt-12">
          <h2 className="text-2xl font-bold text-[#84b6f4]">Mapa de NDVI</h2>
          <p className="text-l text-center text-white max-w-2xl mx-auto p-4">
            Detecta la salud y densidad de la vegetación al medir la cantidad de clorofila en las plantas. Sirve para identificar áreas con vegetación saludable, estrés, o sequía.
          </p>
          <div className="relative flex flex-row">
            <iframe src={ndviMapUrl} title="Mapa de NDVI" className="mt-8 shadow-lg rounded-lg" width="800" height="600"></iframe>
            {/* Leyenda del NDVI */}
            <div className="ml-4 bg-white text-black p-6 rounded-lg shadow-lg max-w-xs">
              <h3 className="font-bold mb-4 text-center">Simbología</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <div
                    style={{ width: '20px', height: '20px', backgroundColor: '#6CB716', border: '1px solid #000' }}
                    className="mr-2"
                  ></div>
                  <span className="text-sm font-medium">Suelo desnudo</span>
                </div>
                <div className="flex items-center">
                  <div
                    style={{ width: '20px', height: '20px', backgroundColor: '#FE803A', border: '1px solid #000' }}
                    className="mr-2"
                  ></div>
                  <span className="text-sm font-medium">Sin densidad de vegetación</span>
                </div>
                <div className="flex items-center">
                  <div
                    style={{ width: '20px', height: '20px', backgroundColor: '#F8DB62', border: '1px solid #000' }}
                    className="mr-2"
                  ></div>
                  <span className="text-sm font-medium">Baja densidad de vegetación</span>
                </div>
                <div className="flex items-center">
                  <div
                    style={{ width: '20px', height: '20px', backgroundColor: '#E0434F', border: '1px solid #000' }}
                    className="mr-2"
                  ></div>
                  <span className="text-sm font-medium">Alta vegetación</span>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600 leading-6 text-justify">
                <p><strong>Suelo desnudo:</strong> Áreas sin vegetación, típicamente con exposición de suelo o construcciones.</p>
                <p><strong>Sin densidad de vegetación:</strong> Zonas con poca o nula cobertura vegetal, posiblemente áreas de cultivo con vegetación en etapas tempranas o zonas degradadas.</p>
                <p><strong>Baja densidad de vegetación:</strong> Vegetación escasa, posiblemente en estado de estrés o en crecimiento inicial.</p>
                <p><strong>Alta vegetación:</strong> Zonas con vegetación densa y saludable, típicamente cultivos o áreas forestales en buen estado.</p>
              </div>
            </div>

            
          </div>
        </div>
      )}

      {/* Sección para mostrar el mapa NDRE */}
      {ndreMapUrl && (
        <div className="relative z-20 flex flex-col items-center justify-center mt-12">
          <h2 className="text-2xl font-bold text-[#84b6f4]">Mapa de NDRE</h2>
          <p className="text-l text-center text-white max-w-2xl mx-auto p-4">
            Detecta el estrés temprano en las plantas. Sirve para monitorear deficiencias de nutrientes y estrés hídrico.
          </p>
          <div className="relative flex flex-row">
            <iframe src={ndreMapUrl} title="Mapa de NDRE" className="mt-8 shadow-lg rounded-lg" width="800" height="600"></iframe>
            {/* Leyenda del NDRE */}
            <div className="ml-4 bg-white text-black p-6 rounded-lg shadow-lg max-w-xs">
              <h3 className="font-bold mb-4 text-center">Simbología</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#BEBAB9', border: '1px solid #000' }}></div>
                  <span className="ml-2">Suelo expuesto</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#8D6F64', border: '1px solid #000' }}></div>
                  <span className="ml-2">Bajo estrés hídrico</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#F2D45C', border: '1px solid #000' }}></div>
                  <span className="ml-2">Vegetación moderado</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FE9900', border: '1px solid #000' }}></div>
                  <span className="ml-2">Vegetación en buen estado</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#AEC629', border: '1px solid #000' }}></div>
                  <span className="ml-2">Vegetación en excelente estado</span>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600 leading-6 text-justify">
                <p><strong>Suelo expuesto:</strong> Superficies sin vegetación, visibles en zonas urbanas o áreas agrícolas no cultivadas.</p>
                <p><strong>Bajo estrés hídrico:</strong> Zonas de vegetación con suficiente agua y nutrientes.</p>
                <p><strong>Condición intermedia:</strong> Vegetación en estado de transición, que podría estar en riesgo de estrés hídrico o de nutrientes.</p>
                <p><strong>Buena vegetación:</strong> Áreas con vegetación sana y en crecimiento.</p>
                <p><strong>Vegetación excelente:</strong> Zonas con vegetación óptima, mostrando altos niveles de salud y crecimiento.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección para mostrar el mapa NDMI */}
      {ndmiMapUrl && (
        <div className="relative z-20 flex flex-col items-center justify-center my-12">
          <h2 className="text-2xl font-bold text-[#84b6f4]">Mapa de NDMI</h2>
          <p className="text-l text-center text-white max-w-2xl mx-auto p-4">
            Evalúa la humedad de la vegetación, ayudando a gestionar mejor el riego y detectar áreas afectadas por sequía.
          </p>
          <div className="relative flex flex-row">
            <iframe src={ndmiMapUrl} title="Mapa de NDMI" className="mt-8 shadow-lg rounded-lg" width="800" height="600"></iframe>
            {/* Leyenda del NDMI */}
            <div className="ml-4 bg-white text-black p-6 rounded-lg shadow-lg max-w-xs">
              <h3 className="font-bold mb-4 text-center">Simbología</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', border: '1px solid #000' }}></div>
                  <span className="ml-2">Baja humedad</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FFC0CB', border: '1px solid #000' }}></div>
                  <span className="ml-2">Humedad moderada</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#0000FF', border: '1px solid #000' }}></div>
                  <span className="ml-2">Humedad favorable</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#008000', border: '1px solid #000' }}></div>
                  <span className="ml-2">Alta humedad</span>
                </div>
                
              </div>
              <div className="mt-6 text-sm text-gray-600 leading-6 text-justify">
                <p><strong>Baja humedad:</strong> Áreas con muy poca humedad en el suelo o vegetación, lo que podría indicar sequía o necesidad de riego.</p>
                <p><strong>Humedad moderada:</strong> Niveles aceptables de humedad en la vegetación, pero que podrían mejorar.</p>
                <p><strong>Humedad favorable:</strong> Áreas con suficiente humedad para mantener un crecimiento adecuado de la vegetación.</p>
                <p><strong>Alta humedad:</strong> Zonas con exceso de humedad, lo que podría llevar a encharcamiento o condiciones subóptimas para ciertos cultivos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomeView;
