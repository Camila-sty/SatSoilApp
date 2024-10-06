import ee
import geemap
import numpy as np

# Authenticate and initialize Earth Engine
ee.Authenticate()
ee.Initialize(project="ee-carlitosmadina")

# Define the region of interest (Maule Region, Chile) as a polygon
maule_region = ee.Geometry.Polygon([
    [[-72.5, -35.5],
     [-71.5, -35.5],
     [-71.5, -36.5],
     [-72.5, -36.5]]
])

# Create a Map object with geemap centered in the Maule Region
comunas = ee.FeatureCollection('users/carlitosmadina/Comunas')
parral = comunas.filter(ee.Filter.eq('Comuna', 'Parral'))

# Function to calculate NDRE manually using the formula (NIR - Red Edge) / (NIR + Red Edge)
def calculate_ndre(image):
    # Select bands
    nir = image.select('B8')  # Band B8 has 10m resolution
    red_edge = image.select('B6')  # Band B6 has 20m resolution

    # Downsample Band B8 (NIR) to match the resolution of Band B6 (20m)
    nir_downsampled = nir.reproject(crs=red_edge.projection(), scale=20)

    # Calculate NDRE: (NIR - Red Edge) / (NIR + Red Edge)
    ndre = nir_downsampled.subtract(red_edge).divide(nir_downsampled.add(red_edge)).rename('NDRE')

    return ndre.clip(parral)

# Load Sentinel-2 image collection for January 2023
image1 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(parral.geometry()) \
            .filterDate("2023-01-01", "2023-01-31")

# Calculate NDRE for January
ndre1 = image1.map(calculate_ndre)
ndre1_mean = ndre1.mean()

# Load Sentinel-2 image collection for May 2023
image5 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(parral.geometry()) \
            .filterDate("2023-10-01", "2023-10-31")

# Calculate NDRE for May
ndre5 = image5.map(calculate_ndre)
ndre5_mean = ndre5.mean()

# Classify NDRE into intervals with negative and 0 values as red, and positive values increasing by 0.1 intervals
def classify_ndre(ndre_image):
    return (ndre_image
            .where(ndre_image.lte(0), 1)  # Classify as 1 (Red)
            .where(ndre_image.gt(0).And(ndre_image.lte(0.1)), 2)  # Classify as 2 (Purple)
            .where(ndre_image.gt(0.1).And(ndre_image.lte(0.2)), 3)  # Classify as 3 (Pink)
            .where(ndre_image.gt(0.2).And(ndre_image.lte(0.3)), 4)  # Classify as 4 (Blue)
            .where(ndre_image.gt(0.3).And(ndre_image.lte(0.4)), 5)  # Classify as 5 (Cyan)
            .where(ndre_image.gt(0.4).And(ndre_image.lte(0.5)), 6)  # Classify as 6 (Grey)
            .where(ndre_image.gt(0.5).And(ndre_image.lte(0.6)), 7)  # Classify as 7 (Black)
            .where(ndre_image.gt(0.6).And(ndre_image.lte(0.7)), 8)  # Classify as 8 (Light Green)
            .where(ndre_image.gt(0.7).And(ndre_image.lte(0.8)), 9)  # Classify as 9 (Green)
            .where(ndre_image.gt(0.8).And(ndre_image.lte(0.9)), 10)  # Classify as 10 (Dark Green)
            .where(ndre_image.gt(0.9).And(ndre_image.lte(1)), 11)  # Classify as 11 (White)
            )

# Classify NDRE for January and May
classified_ndre1 = classify_ndre(ndre1_mean)
classified_ndre5 = classify_ndre(ndre5_mean)

# Define visualization parameters for NDRE with specified colors
ndre_class_params = {
    'min': 1,
    'max': 11,
    'palette': [
        "#FF0000",  # Red for negative and 0 values
        "#800080",  # Purple for 0 to 0.1
        "#FFC0CB",  # Pink for 0.1 to 0.2
        "#0000FF",  # Blue for 0.2 to 0.3
        "#00FFFF",  # Cyan for 0.3 to 0.4
        "#808080",  # Grey for 0.4 to 0.5
        "#000000",  # Black for 0.5 to 0.6
        "#90EE90",  # Light Green for 0.6 to 0.7
        "#008000",  # Green for 0.7 to 0.8
        "#006400",  # Dark Green for 0.8 to 0.9
        "#FFFFFF"   # White for 0.9 to 1
    ]
}

# Create a Map object for the January NDRE classification and add it to the map
Map1 = geemap.Map(center=[-36.0, -72.0], zoom=8)
Map1.addLayer(parral, {}, 'Parral')
Map1.addLayer(classified_ndre1, ndre_class_params, "Classified NDRE (January 2023)")

# Save the first map to an HTML file (ending with 1 for January)
Map1.save("classified_ndre_1.html")

# Create a Map object for the May NDRE classification and add it to the map
Map5 = geemap.Map(center=[-36.0, -72.0], zoom=8)
Map5.addLayer(parral, {}, 'Parral')
Map5.addLayer(classified_ndre5, ndre_class_params, "Classified NDRE (May 2023)")

# Save the second map to an HTML file (ending with 5 for May)
Map5.save("classified_ndre_5.html")

print("Two HTML files generated: 'classified_ndre_1.html' (January) and 'classified_ndre_5.html' (May)")