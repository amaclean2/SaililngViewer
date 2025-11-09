import { useMemo } from 'react'

import sailingData from './sailing.json'
import { Chart, type AxisOptions } from 'react-charts'

type SogKts = {
  sogKts: number
  timestamp: string
  lngLat: [number, number]
}

type Heel = {
  heelDeg: number
  timestamp: string
  lngLat: [number, number]
}

type SogSeries = {
  label: string
  data: SogKts[]
}

type HeelSeries = {
  label: string
  data: Heel[]
}

type Properties = {
  sog_kts: number
  heel: number
  timestamp: string
}

console.log({
  sailingData: (sailingData as GeoJSON.FeatureCollection).features[0]
})

const sogData: SogSeries[] = [
  {
    label: 'SOG (kts)',
    data: [
      ...(sailingData as GeoJSON.FeatureCollection).features.map((feature) => ({
        sogKts: Number((feature.properties as Properties).sog_kts),
        timestamp: (feature.properties as Properties).timestamp,
        lngLat: (feature.geometry as GeoJSON.Point).coordinates as [
          number,
          number
        ]
      }))
    ]
  }
]

const heelData: HeelSeries[] = [
  {
    label: 'Heel (deg)',
    data: [
      ...(sailingData as GeoJSON.FeatureCollection).features.map((feature) => ({
        heelDeg: Number((feature.properties as Properties).heel),
        timestamp: (feature.properties as Properties).timestamp,
        lngLat: (feature.geometry as GeoJSON.Point).coordinates as [
          number,
          number
        ]
      }))
    ]
  }
]

export const DataViz = ({
  setChartLngLat
}: {
  setChartLngLat: (lngLat: [number, number]) => void
}) => {
  const primaryAxisSog = useMemo(
    (): AxisOptions<SogKts> => ({
      getValue: (datum) => new Date(datum.timestamp),
      scaleType: 'time',
      formatters: {
        scale: (value) => new Date(value).toLocaleTimeString()
      }
    }),
    []
  )

  const primaryAxisHeel = useMemo(
    (): AxisOptions<Heel> => ({
      getValue: (datum) => new Date(datum.timestamp),
      scaleType: 'time',
      formatters: {
        scale: (value) => new Date(value).toLocaleTimeString()
      }
    }),
    []
  )

  const secondaryAxesSog = useMemo(
    (): AxisOptions<SogKts>[] => [
      {
        getValue: (datum) => datum.sogKts,
        scaleType: 'linear'
      }
    ],
    []
  )

  const secondaryAxesHeel = useMemo(
    (): AxisOptions<Heel>[] => [
      {
        getValue: (datum) => datum.heelDeg,
        scaleType: 'linear'
      }
    ],
    []
  )

  return (
    <div className={'charts'}>
      <h3>Speed Over Ground</h3>
      <div className={'chart-container'}>
        <Chart
          options={{
            data: sogData,
            primaryAxis: primaryAxisSog,
            secondaryAxes: secondaryAxesSog,
            onFocusDatum: (datum) => {
              if (datum) setChartLngLat(datum.originalDatum.lngLat)
            }
          }}
        />
      </div>
      <h3>Heel Angle</h3>
      <div className={'chart-container'}>
        <Chart
          options={{
            data: heelData,
            primaryAxis: primaryAxisHeel,
            secondaryAxes: secondaryAxesHeel,
            onFocusDatum: (datum) => {
              if (datum) setChartLngLat(datum.originalDatum.lngLat)
            }
          }}
        />
      </div>
    </div>
  )
}
