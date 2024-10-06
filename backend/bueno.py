import ee
import geemap

# Autenticar e inicializar Earth Engine usando las credenciales de la cuenta de servicio
service_account = 'satsoil-service-account@nasa-space-app-satsoil.iam.gserviceaccount.com'
key_file = 'credentials/googleAppi.json'
credentials = ee.ServiceAccountCredentials(service_account, key_file)
ee.Initialize(credentials)

# Definir la región de interés (Región del Maule, Chile) como un polígono
maule_region = ee.Geometry.Polygon([
    [[-72.5, -35.5],
     [-71.5, -35.5],
     [-71.5, -36.5],
     [-72.5, -36.5]]    
])

# Crear un objeto de mapa con geemap centrado en la Región del Maule
Map = geemap.Map()

# Usar un asset público de límites administrativos de Chile y filtrar por la comuna de Parral
chile_admin = ee.FeatureCollection('FAO/GAUL/2015/level2') \
                .filter(ee.Filter.eq('ADM1_NAME', 'Maule')) \
                .filter(ee.Filter.eq('ADM2_NAME', 'Parral'))

# Añadir la capa de los límites de la comuna de Parral al mapa
Map.addLayer(chile_admin, {}, 'Límites de Parral')
Map.centerObject(chile_admin, 10)  # Zoom a la comuna

# Función para calcular el NDVI
def getNDVI(image):
    return image.normalizedDifference(['B8', 'B4']).clip(chile_admin)

# Cargar la colección de imágenes de Sentinel-2
image1 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(chile_admin) \
            .filterDate("2023-01-01", "2023-02-01")

# Calcular NDVI para el área seleccionada
ndvi1 = image1.map(getNDVI)

# Definir los parámetros de visualización
ndviParams = {
    'palette': ["#FFFFFF", "#D0F0C0", "#A0DAB5", "#68B684", "#008000"],
    'min': 0,
    'max': 1
}

# Crear una capa y agregarla al mapa
ndvi_layer = ndvi1.mean().visualize(**ndviParams)
Map.addLayer(ndvi_layer, {}, "NDVI")

# Guardar el mapa como un archivo HTML
Map.save("ndvi_map_public_parral.html")
