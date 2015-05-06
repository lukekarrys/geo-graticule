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
    t.deepEqual(geo.toArray(), [34.5, -111.1], index + ' toArray')
    t.deepEqual(geo.toJSON(), {latitude: 34.5, longitude: -111.1}, index + ' toJSON')
    t.equal(geo.latitude, 34.5, index + ' latitude')
    t.equal(geo.longitude, -111.1, index + ' longitude')
    t.equal(true, true, '---------------------------------')
  })

  t.end()
})

test('Get quadrant', (t) => {
  t.equal(new Geo(34.5, -111.1).quadrant(), 'NW', 'NW quadrant')
  t.equal(new Geo(-34.5, -111.1).quadrant(), 'SW', 'SW quadrant')
  t.equal(new Geo(-34.5, 111.1).quadrant(), 'SE', 'SE quadrant')
  t.equal(new Geo(34.5, 111.1).quadrant(), 'NE', 'NE quadrant')
  t.end()
})

test('Get graticule', (t) => {
  const geo1 = new Geo(34.5, -111.1).graticule()
  const geo2 = new Geo(-34.5, -111.1).graticule()
  const geo3 = new Geo(-34.5, 111.1).graticule()
  const geo4 = new Geo(34.5, 111.1).graticule()

  t.deepEqual(geo1, [34, -111], 'NW quadrant')
  t.deepEqual(geo2, [-34, -111], 'SW quadrant')
  t.deepEqual(geo3, [-34, 111], 'SE quadrant')
  t.deepEqual(geo4, [34, 111], 'NE quadrant')

  t.end()
})

test('Get point within graticule', (t) => {
  const geo1 = new Geo(34.5, -111.1).pointWithinGraticule(0.1, 0.1)
  const geo2 = new Geo(-34.5, -111.1).pointWithinGraticule(0.1, 0.1)
  const geo3 = new Geo(-34.5, 111.1).pointWithinGraticule(0.1, 0.1)
  const geo4 = new Geo(34.5, 111.1).pointWithinGraticule(0.1, 0.1)

  t.deepEqual(geo1, [34.1, -111.1], 'NW quadrant')
  t.deepEqual(geo2, [-34.1, -111.1], 'SW quadrant')
  t.deepEqual(geo3, [-34.1, 111.1], 'SE quadrant')
  t.deepEqual(geo4, [34.1, 111.1], 'NE quadrant')

  t.end()
})

test('Get graticule center', (t) => {
  const geo1 = new Geo(34.5, -111.1).graticuleCenter()
  const geo2 = new Geo(-34.5, -111.1).graticuleCenter()
  const geo3 = new Geo(-34.5, 111.1).graticuleCenter()
  const geo4 = new Geo(34.5, 111.1).graticuleCenter()

  t.deepEqual(geo1, [34.5, -111.5], 'NW quadrant')
  t.deepEqual(geo2, [-34.5, -111.5], 'SW quadrant')
  t.deepEqual(geo3, [-34.5, 111.5], 'SE quadrant')
  t.deepEqual(geo4, [34.5, 111.5], 'NE quadrant')

  t.end()
})

test('Get graticule box', (t) => {
  const boxes = [
    new Geo(34.4, -111.1).graticuleBox(),
    new Geo(-34.4, -111.1).graticuleBox(),
    new Geo(-34.4, 111.1).graticuleBox(),
    new Geo(34.4, 111.1).graticuleBox()
  ]

  const expected = [
    [[34, -111], [34, -112], [35, -112], [35, -111]],
    [[-35, -111], [-35, -112], [-34, -112], [-34, -111]],
    [[-35, 112], [-35, 111], [-34, 111], [-34, 112]],
    [[34, 112], [34, 111], [35, 111], [35, 112]]
  ]

  t.deepEqual(boxes, expected)
  t.end()
})

test('Get neighbors', (t) => {
  const graticules = [
    new Geo(34.4, -111.1).neighboringGraticules(),
    new Geo(-34.4, -111.1).neighboringGraticules(),
    new Geo(-34.4, 111.1).neighboringGraticules(),
    new Geo(34.4, 111.1).neighboringGraticules()
  ]

  const expected = [
    [ // NW
      [35, -110], [35, -111], [35, -112],
      [34, -112], [34, -111], [34, -110],
      [33, -110], [33, -111], [33, -112]
    ],
    [ // SW
      [-35, -112], [-35, -111], [-35, -110],
      [-34, -110], [-34, -111], [-34, -112],
      [-33, -112], [-33, -111], [-33, -110]
    ],
    [ // SE
      [-35, 112], [-35, 111], [-35, 110],
      [-34, 110], [-34, 111], [-34, 112],
      [-33, 112], [-33, 111], [-33, 110]
    ],
    [ // NE
      [35, 110], [35, 111], [35, 112],
      [34, 112], [34, 111], [34, 110],
      [33, 110], [33, 111], [33, 112]
    ]
  ]

  t.deepEqual(graticules[0], expected[0], 'NW')
  t.deepEqual(graticules[1], expected[1], 'SW')
  t.deepEqual(graticules[2], expected[2], 'SE')
  t.deepEqual(graticules[3], expected[3], 'NE')
  t.end()
})
