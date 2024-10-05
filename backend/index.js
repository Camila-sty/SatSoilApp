const express = require('express');
const cors = require('cors');  // Importa CORS para evitar problemas con el frontend

const app = express();
const port = 5001;

// Habilitar CORS
app.use(cors());

// Ruta principal para enviar una respuesta
app.get('/', (req, res) => {
  res.json({ message: "¡Hola mundo!" });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});