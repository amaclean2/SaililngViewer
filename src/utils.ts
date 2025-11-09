export const convertFeatureCollectionToLineString = (
  featureCollection: GeoJSON.FeatureCollection
): GeoJSON.Feature => {
  const lineStringCoordinates: GeoJSON.Position[] = []

  featureCollection.features.forEach((feature) => {
    if (feature.geometry.type === 'Point') {
      lineStringCoordinates.push(feature.geometry.coordinates)
    }
  })

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: lineStringCoordinates
    },
    properties: {}
  }
}
