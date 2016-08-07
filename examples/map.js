import {stringify} from 'qs'
import defaults from 'lodash/defaults'
import open from 'open'
import async from 'async'

import Geo from '../src/index'

const BASE_URL = 'https://maps.googleapis.com/maps/api/staticmap?'
const mapDefaults = {
  size: '600x600',
  maptype: 'hybrid',
  zoom: 7,
  markers: []
}

const toMarker = (options = {}) => {
  const {geo, label} = options
  return [
    'color:blue',
    'label:' + label,
    new Geo(geo).toString()
  ].join('|')
}

const appendFirstIndex = (arr) => arr.concat([arr[0]])

const toBoxPath = (boxes) => {
  const delimiter = '|'

  const pathPoints = boxes.map(appendFirstIndex).map((box) => {
    return box.map((point) => point.join(',')).join(delimiter)
  }).join(delimiter)

  const pathOptions = stringify({
    color: '0xff0000ff',
    weight: 3
  }, {delimiter}).replace(/=/g, ':')

  return pathOptions + delimiter + pathPoints
}

const getMapUrl = (options = {}) => {
  const params = defaults(options, mapDefaults)

  params.markers = params.markers.map((marker, index) => {
    return toMarker({label: index, geo: marker})
  })

  if (params.boxes) {
    params.path = toBoxPath(params.boxes)
    delete params.boxes
  }

  return BASE_URL + stringify(params, {arrayFormat: 'repeat'})
}

async.eachSeries([
  new Geo(34.4, -111.1),
  new Geo(-34.4, -111.1),
  new Geo(-34.4, 111.1),
  new Geo(34.4, 111.1)
], (geo, cb) => {
  async.eachSeries([
    getMapUrl({
      markers: geo.graticuleBox()
    }),
    getMapUrl({
      boxes: geo.neighboringGraticuleBoxes(),
      markers: geo.neighboringGraticulePoints(0.1, 0.1)
    })
  ], (url, cb) => url ? open(url, null, cb) : cb(), cb)
})
