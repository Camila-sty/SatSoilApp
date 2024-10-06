const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

require('dotenv').config();

// Ahora puedes acceder a tus variables de entorno
const googleApiKey = process.env.GOOGLE_API_KEY;
const googleClientId = process.env.GOOGLE_CLIENT_ID;

// Ruta al archivo JSON con tus credenciales de la cuenta de servicio
const CREDENTIALS_PATH = './credentials/googleAppi.json'; // Cambia esto por el nombre real de tu archivo

async function getFilmstripPixels() {
  try {
    // Configurar la autenticación con la cuenta de servicio
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/earthengine'],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    // Reemplaza con el ID del proyecto y el filmstripThumbnail que obtuviste
    const name = 'projects/nasa-space-app-satsoil/filmstripThumbnails/COPERNICUS/S2_SR_HARMONIZED/20231001T102739_20231001T103225_T31TFL';

    // Hacer la solicitud GET al endpoint getPixels
    const response = await axios.get(`https://earthengine.googleapis.com/v1beta/${name}:getPixels`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'arraybuffer', // Para recibir los datos binarios, como imágenes o píxeles
    });

    // Guardar los datos recibidos como un archivo (ejemplo: imagen PNG)
    fs.writeFileSync('output_image.png', response.data);
    console.log('La imagen ha sido guardada como output_image.png');
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
  }
}

// Llamar a la función para probar la solicitud GET
getFilmstripPixels();
