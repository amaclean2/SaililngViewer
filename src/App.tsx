import { useEffect, useRef, useState } from 'react'
import mapboxgl, { type LngLatLike } from 'mapbox-gl'

import { convertFeatureCollectionToLineString } from './utils'
import sailingCoords from './sailing.json'

type SailingData = GeoJSON.Feature<GeoJSON.LineString>

import './App.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { DataViz } from './DataViz'

const INITIAL_CENTER = [-118.1, 33.7] as LngLatLike
const INITIAL_ZOOM = 11

const convertedSailingCoords = convertFeatureCollectionToLineString(
  sailingCoords as GeoJSON.FeatureCollection
)

const App = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [chartLngLat, setChartLngLat] = useState<LngLatLike | null>(null)
  const [styleLoaded, setStyleLoaded] = useState(false)

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? ''

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      // long beach
      center,
      zoom
    })

    mapRef.current.on('load', () => {
      setStyleLoaded(true)
    })

    mapRef.current.on('move', () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current!.getCenter()
      const mapZoom = mapRef.current!.getZoom()

      // update state
      setCenter([mapCenter.lng, mapCenter.lat])
      setZoom(mapZoom)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!styleLoaded || !mapRef.current) return

    // add a source from sailingCoords
    mapRef.current!.addSource('sailing', {
      type: 'geojson',
      data: convertedSailingCoords as SailingData
    })

    // add a layer to visualize the sailing path
    mapRef.current!.addLayer({
      id: 'sailing-layer',
      type: 'line',
      source: 'sailing',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'rgb(15, 131, 171)',
        'line-width': 2
      }
    })

    // zoom to the sailing path
    const coordinates = (convertedSailingCoords.geometry as GeoJSON.LineString)
      .coordinates
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord as [number, number])
    }, new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]))

    mapRef.current!.fitBounds(bounds, {
      padding: 20
    })
  }, [styleLoaded])

  useEffect(() => {
    if (!chartLngLat || !mapRef.current) return

    new mapboxgl.Marker({ color: 'red' })
      .setLngLat(chartLngLat)
      .addTo(mapRef.current)

    return () => {
      // remove all markers
      const markers = document.getElementsByClassName('mapboxgl-marker')
      while (markers[0]) {
        markers[0].parentNode?.removeChild(markers[0])
      }
    }
  }, [chartLngLat])

  return (
    <>
      <div className={'mapbox-container'} ref={mapContainerRef} />
      <DataViz setChartLngLat={setChartLngLat} />
    </>
  )
}

export default App
