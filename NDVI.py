import ee
import geemap

# Params 

id_project = "ee-carlitosmadina"



# Authenticate and initialize Earth Engine
ee.Authenticate()
ee.Initialize(project=id_project)

# Create a FeatureCollection for the Parral commune
comunas = ee.FeatureCollection('users/carlitosmadina/Comunas')
parral = comunas.filter(ee.Filter.eq('Comuna', 'Parral'))

# Function to calculate NDVI for Sentinel-2 images
def getNDVI(image):
    # Calculate NDVI using bands B8 (NIR) and B4 (Red)
    return image.normalizedDifference(['B8', 'B4']).rename('NDVI').clip(parral)

# Load Sentinel-2 image collection for January 2023
image1 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(parral.geometry()) \
            .filterDate("2023-01-01", "2023-01-31")

# Calculate NDVI for January 2023
ndvi1 = image1.map(getNDVI)

# Load Sentinel-2 image collection for May 2023
image5 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(parral.geometry()) \
            .filterDate("2023-10-01", "2023-10-31")

# Calculate NDVI for May 2023
ndvi5 = image5.map(getNDVI)

# Define visualization parameters for NDVI
ndviParams = {
    'palette': ["#FFFFFF", "#D0F0C0", "#A0DAB5", "#68B684", "#008000"],
    'min': 0,
    'max': 1
}

# Create a Map object for January NDVI
Map1 = geemap.Map()
Map1.addLayer(parral, {}, 'Parral')
Map1.centerObject(parral, 8)
ndvi_layer_jan = ndvi1.mean().visualize(**ndviParams)
Map1.addLayer(ndvi_layer_jan, {}, "NDVI (January 2023)")

# Save the January NDVI map to an HTML file
Map1.save("ndvi_1.html")

# Create a Map object for May NDVI
Map5 = geemap.Map()
Map5.addLayer(parral, {}, 'Parral')
Map5.centerObject(parral, 8)
ndvi_layer_may = ndvi5.mean().visualize(**ndviParams)
Map5.addLayer(ndvi_layer_may, {}, "NDVI (May 2023)")

# Save the May NDVI map to an HTML file
Map5.save("ndvi_5.html")

print("Two HTML files generated: 'ndvi_1.html' (January NDVI) and 'ndvi_5.html' (May NDVI)")