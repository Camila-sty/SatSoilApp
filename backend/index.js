const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();

// Habilitar CORS
app.use(cors());

// Servir el archivo HTML generado
app.use('/output', express.static(path.join(__dirname, 'output')));

// Ruta para calcular los índices NDVI y NDRE y generar el HTML
app.get('/calculate-indices', (req, res) => {
  const { startDate, endDate, coords } = req.query;

  // Ejecutar el script de Python con los parámetros correspondientes
  exec(`python3 generate_map.py ${startDate} ${endDate} "${coords}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el script: ${error.message}`);
      return res.status(500).send('Error al generar el mapa.');
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send('Error en el script de Python.');
    }

    // Enviar el HTML generado al frontend
    res.sendFile(path.join(__dirname, 'output', 'ndvi_map.html'));
  });
});

// Iniciar el servidor en el puerto 5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
