import test from 'tape'

import Geo from '../src/index'

test('Different inputs work', (t) => {
  const latitude = 34.5
  const longitude = -111.1
  const geos = [
    new Geo([latitude, longitude]),
    new Geo({latitude, longitude}),
    new Geo({lat: latitude, lon: longitude}),
    new Geo({lat: latitude, long: longitude}),
    new Geo(latitude, longitude),
    new Geo([latitude, longitude].join(',')),
    new Geo(latitude.toString(), longitude.toString())
  ]

  geos.forEach((geo, index) => {
    t.equal(geo.toString(), '34.5,-111.1', index + ' toString')
    t.equal(geo.toArray()[0], 34.5, index + ' toArray 0')
    t.equal(geo.toArray()[1], -111.1, index + ' toArray 1')
    t.equal(geo.toObject().latitude, 34.5, index + ' toObject latitude')
    t.equal(geo.toObject().longitude, -111.1, index + ' toObject longitude')
    t.equal(geo.latitude, 34.5, index + ' latitude')
    t.equal(geo.longitude, -111.1, index + ' longitude')
    t.equal(true, true, '---------------------------------')
  })

  t.end()
})

test('Get quadrant', (t) => {
  t.equal(new Geo(34.5, -111.1).getQuadrant(), 'NW', 'NW quadrant')
  t.equal(new Geo(-34.5, -111.1).getQuadrant(), 'SW', 'SW quadrant')
  t.equal(new Geo(-34.5, 111.1).getQuadrant(), 'SE', 'SE quadrant')
  t.equal(new Geo(34.5, 111.1).getQuadrant(), 'NE', 'NE quadrant')
  t.end()
})

test('Get graticule', (t) => {
  const [lat1, lon1] = new Geo(34.5, -111.1).getGraticule()
  const [lat2, lon2] = new Geo(-34.5, -111.1).getGraticule()
  const [lat3, lon3] = new Geo(-34.5, 111.1).getGraticule()
  const [lat4, lon4] = new Geo(34.5, 111.1).getGraticule()

  t.equal(lat1, 34, 'NW quadrant latitude')
  t.equal(lat2, -34, 'SW quadrant latitude')
  t.equal(lat3, -34, 'SE quadrant latitude')
  t.equal(lat4, 34, 'NE quadrant latitude')

  t.equal(lon1, -111, 'NW quadrant longitude')
  t.equal(lon2, -111, 'SW quadrant longitude')
  t.equal(lon3, 111, 'SE quadrant longitude')
  t.equal(lon4, 111, 'NE quadrant longitude')

  t.end()
})

test('Get graticule center', (t) => {
  const [lat1, lon1] = new Geo(34.4, -111.1).getGraticuleCenter()
  const [lat2, lon2] = new Geo(-34.4, -111.1).getGraticuleCenter()
  const [lat3, lon3] = new Geo(-34.4, 111.1).getGraticuleCenter()
  const [lat4, lon4] = new Geo(34.4, 111.1).getGraticuleCenter()

  t.equal(lat1, 34.5, 'NW quadrant latitude')
  t.equal(lat2, -34.5, 'SW quadrant latitude')
  t.equal(lat3, -34.5, 'SE quadrant latitude')
  t.equal(lat4, 34.5, 'NE quadrant latitude')

  t.equal(lon1, -111.5, 'NW quadrant longitude')
  t.equal(lon2, -111.5, 'SW quadrant longitude')
  t.equal(lon3, 111.5, 'SE quadrant longitude')
  t.equal(lon4, 111.5, 'NE quadrant longitude')

  t.end()
})

test('Get graticule box', (t) => {
  const boxes = [
    new Geo(34.4, -111.1).getGraticuleBox(),
    new Geo(-34.4, -111.1).getGraticuleBox(),
    new Geo(-34.4, 111.1).getGraticuleBox(),
    new Geo(34.4, 111.1).getGraticuleBox()
  ]

  const expected = [
    [[34, -111], [34, -112], [35, -112], [35, -111]],
    [[-34, -111], [-34, -112], [-35, -112], [-35, -111]],
    [[-34, 111], [-34, 112], [-35, 112], [-35, 111]],
    [[34, 111], [34, 112], [35, 112], [35, 111]]
  ]

  const m = (box, point, coordinate) => {
    const messages = {
      box: ['NW', 'SW', 'SE', 'NE'],
      point: ['1', '2', '3', '4'],
      coordinate: ['latitude', 'longitude']
    }

    return `${messages.box[box]} ${messages.point[point]} ${messages.coordinate[coordinate]}`
  }

  boxes.forEach((box, bIndex) => {
    box.forEach((point, pIndex) => {
      point.forEach((coordinate, cIndex) => {
        t.equal(coordinate, expected[bIndex][pIndex][cIndex], m(bIndex, pIndex, cIndex))
      })
    })
  })

  t.end()
})
