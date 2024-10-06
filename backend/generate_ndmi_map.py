import ee
import geemap
import sys

# Verifica que los argumentos de provincia y fechas hayan sido proporcionados
if len(sys.argv) != 4:
    print("Uso: python generate_ndvi_map.py <provincia_name> <start_date> <end_date>")
    sys.exit(1)

# Recibe los parámetros de la provincia y rango de fechas desde la línea de comandos
provincia_name = sys.argv[1]  # Primer argumento es la provincia
start_date = sys.argv[2]      # Segundo argumento es la fecha de inicio
end_date = sys.argv[3]        # Tercer argumento es la fecha de término

# Imprimir los parámetros recibidos para depuración
print(f"Provincia recibida: {provincia_name}")
print(f"Fecha de inicio: {start_date}")
print(f"Fecha de término: {end_date}")

# Autenticar e inicializar Earth Engine usando las credenciales de la cuenta de servicio
service_account = 'satsoil-service-account@nasa-space-app-satsoil.iam.gserviceaccount.com'
key_file = 'credentials/googleAppi.json'
credentials = ee.ServiceAccountCredentials(service_account, key_file)
ee.Initialize(credentials)

# Crear un objeto de mapa con geemap
Map = geemap.Map()

# Validar que solo se puedan seleccionar las provincias disponibles en la región de Maule
provincias_validas = ['Linares', 'Curico', 'Talca', 'Cauquenes']

# Verifica si la provincia es válida
if provincia_name not in provincias_validas:
    print(f"Provincia '{provincia_name}' no es válida. Opciones válidas: {provincias_validas}")
    sys.exit(1)

# Usar un asset público de límites administrativos de Chile y filtrar por la provincia proporcionada
chile_admin = ee.FeatureCollection('FAO/GAUL/2015/level2') \
                .filter(ee.Filter.eq('ADM1_NAME', 'Maule')) \
                .filter(ee.Filter.eq('ADM2_NAME', provincia_name))

# Verifica si la provincia existe
provincia_count = chile_admin.size().getInfo()
if provincia_count == 0:
    print(f"Provincia '{provincia_name}' no encontrada en la región de Maule, Chile.")
    sys.exit(1)

# Añadir la capa de los límites de la provincia al mapa
Map.addLayer(chile_admin, {}, f'Límites de {provincia_name}')
Map.centerObject(chile_admin, 10)  # Zoom a la provincia

# Función para calcular el NDVI
def calculate_ndmi(image):
    # Select bands
    nir = image.select('B8')  # Band B8 has 10m resolution
    swir = image.select('B11')  # Band B6 has 20m resolution

    # Downsample Band B8 (NIR) to match the resolution of Band B11 (20m)
    nir_downsampled = nir.reproject(crs=swir.projection(), scale=20)

    # Calculate NDRE: (NIR - Red Edge) / (NIR + Red Edge)
    ndmi = nir_downsampled.subtract(swir).divide(nir_downsampled.add(swir)).rename('NDMI')

    return ndmi.clip(chile_admin)

# Cargar la colección de imágenes de Sentinel-2 usando las fechas proporcionadas
image_collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(chile_admin) \
            .filterDate(start_date, end_date)

# Verificar si hay imágenes disponibles en el rango de fechas
image_count = image_collection.size().getInfo()
if image_count == 0:
    print(f"No hay imágenes disponibles para la provincia '{provincia_name}' en el rango de fechas: {start_date} a {end_date}.")
    sys.exit(1)

# Calcular NDVI para el área seleccionada
ndmi_image = image_collection.map(calculate_ndmi).mean()

# Definir los parámetros de visualización
def classify_ndmi(ndmi_image):
    return (ndmi_image
            .where(ndmi_image.lte(-0.1), 1)  # Classify as 1 (Red)
            .where(ndmi_image.gt(-0.1).And(ndmi_image.lte(0.1)), 2)  # Classify as 2 (Pink)
            .where(ndmi_image.gt(0.1).And(ndmi_image.lte(0.5)), 3)  # Classify as 3 (Blue)
            .where(ndmi_image.gt(0.5).And(ndmi_image.lte(1)), 4)  # Classify as 4 (Green)
            )

# Classify NDRE for January and May
classified_ndmi1 = classify_ndmi(ndmi_image)

# Define visualization parameters for NDRE with specified colors
ndmi_class_params = {
    'min': 1,
    'max': 4,
    'palette': [
        "#FF0000",  # Red for negative and 0/-0.1 values
        "#FFC0CB",  # Purple for -0.1 to +0.1
        "#0000FF",  # Pink for 0.1 to 0.5
        "#008000"   # White for 0.5 to 1
    ]
}

# Crear una capa de NDVI y agregarla al mapa
ndvi_layer = classified_ndmi1.visualize(**ndmi_class_params)
Map.addLayer(ndvi_layer, {}, f"NDMI - {provincia_name}")

# Guardar el mapa como un archivo HTML
output_file = f"ndmi_map_{provincia_name}_{start_date}_{end_date}.html"
Map.save(output_file)

print(f"Mapa de NDMI generado y guardado como {output_file}.")