import ee
import geemap
import sys

# Verifica que los argumentos de provincia y fechas hayan sido proporcionados
if len(sys.argv) != 4:
    print("Uso: python generate_ndre_map.py <provincia_name> <start_date> <end_date>")
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

# Función para calcular el NDRE manualmente
def calculate_ndre(image):
    nir = image.select('B8')  # Banda NIR (10m resolución)
    red_edge = image.select('B6')  # Banda Red Edge (20m resolución)

    # Reproyectar la banda NIR a 20m para que coincida con la banda Red Edge
    nir_downsampled = nir.reproject(crs=red_edge.projection(), scale=20)

    # Calcular NDRE: (NIR - Red Edge) / (NIR + Red Edge)
    ndre = nir_downsampled.subtract(red_edge).divide(nir_downsampled.add(red_edge)).rename('NDRE')
    return ndre.clip(chile_admin)

# Cargar la colección de imágenes de Sentinel-2 usando las fechas proporcionadas
image_collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(chile_admin) \
            .filterDate(start_date, end_date)

# Verificar si hay imágenes disponibles en el rango de fechas
image_count = image_collection.size().getInfo()
if image_count == 0:
    print(f"No hay imágenes disponibles para la provincia '{provincia_name}' en el rango de fechas: {start_date} a {end_date}.")
    sys.exit(1)

# Calcular NDRE para el área seleccionada
ndre_image = image_collection.map(calculate_ndre).mean()

# Definir los parámetros de visualización para clasificar el NDRE
def classify_ndre(ndre_image):
    return (ndre_image
            .where(ndre_image.lte(0), 1)  # Classify as 1 (Red)
            .where(ndre_image.gt(0).And(ndre_image.lte(0.2)), 2)  # Classify as 2 (Pink)
            .where(ndre_image.gt(0.2).And(ndre_image.lte(0.4)), 3)  # Classify as 3 (Blue)
            .where(ndre_image.gt(0.4).And(ndre_image.lte(0.6)), 4)  # Classify as 4 (Green)
            .where(ndre_image.gt(0.6).And(ndre_image.lte(1.0)), 5)  # Classify as 5 (Dark Green)
            )

# Clasificar la imagen NDRE
classified_ndre = classify_ndre(ndre_image)

# Definir los parámetros de visualización para NDRE con los colores especificados
ndre_class_params = {
    'min': 1,
    'max': 5,
    'palette': [
        "#BEBAB9",  # Gray for negative and -1.0/0 values
        "#8D6F64",  # Brown for 0 to +0.2
        "#F2D45C",  # Yellow for 0.2 to 0.4
        "#FE9900",  # Orange for 0.4 to 0.6
        "#AEC629"   # Green for 0.6 to 1.0
    ]
}

# Crear una capa de NDRE y agregarla al mapa
ndre_layer = classified_ndre.visualize(**ndre_class_params)
Map.addLayer(ndre_layer, {}, f"NDRE - {provincia_name}")

# Guardar el mapa como un archivo HTML
output_file = f"ndre_map_{provincia_name}_{start_date}_{end_date}.html"
Map.save(output_file)

print(f"Mapa de NDRE generado y guardado como {output_file}.")
