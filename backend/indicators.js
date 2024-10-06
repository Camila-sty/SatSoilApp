const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());  // Necesario para procesar el cuerpo JSON de solicitudes POST

// Función para generar el mapa y verificar si el archivo existe
const generateMap = (scriptName, comuna, start_date, end_date, mapType, res) => {
  // Ejecutar el script de Python
  exec(`python3 ${scriptName} ${comuna} ${start_date} ${end_date}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el script de Python (${mapType}): ${error.message}`);
      console.error(`stderr: ${stderr}`);
      console.log(`stdout: ${stdout}`);
      return res.status(500).json({ error: `Error al generar el mapa ${mapType}`, details: stderr });
    }

    // Verificar si el archivo fue generado
    const mapFilePath = path.join(__dirname, `${mapType}_map_${comuna}_${start_date}_${end_date}.html`);
    console.log(`Verificando archivo ${mapType} en: ${mapFilePath}`);  // Depuración de ruta de archivo
    if (fs.existsSync(mapFilePath)) {
      console.log(`Mapa ${mapType} generado correctamente: ${mapFilePath}`);
      res.json({ mapUrl: `http://localhost:5001/${mapType}_map_${comuna}_${start_date}_${end_date}.html` });
    } else {
      console.error(`Mapa ${mapType} no encontrado en la ruta: ${mapFilePath}`);
      res.status(500).json({ error: `Mapa ${mapType} no generado` });
    }
  });
};

// Ruta para generar y devolver el mapa NDVI HTML
app.post('/get-ndvi-map', (req, res) => {
  const { comuna, start_date, end_date } = req.body;
  console.log(`Generando mapa NDVI para: ${comuna}, ${start_date} - ${end_date}`);
  generateMap('generate_ndvi_map.py', comuna, start_date, end_date, 'ndvi', res);
});

// Ruta para generar y devolver el mapa NDRE HTML
app.post('/get-ndre-map', (req, res) => {
  const { comuna, start_date, end_date } = req.body;
  console.log(`Generando mapa NDRE para: ${comuna}, ${start_date} - ${end_date}`);
  generateMap('generate_ndre_map.py', comuna, start_date, end_date, 'ndre', res);
});

// Ruta para generar y devolver el mapa NDMI HTML
app.post('/get-ndmi-map', (req, res) => {
  const { comuna, start_date, end_date } = req.body;
  console.log(`Generando mapa NDMI para: ${comuna}, ${start_date} - ${end_date}`);
  generateMap('generate_ndmi_map.py', comuna, start_date, end_date, 'ndmi', res);
});

// Servir los archivos HTML generados
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
