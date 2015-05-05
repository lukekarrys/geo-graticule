import distance from 'node-geo-distance'
import partial from 'lodash/function/partial'

const addArray = (arr, arr2) => [arr[0] + arr2[0], arr[1] + arr2[1]]
const makeBoxArray = (p1, p2, p3) => [[0, 0], p1, p2, p3]
const QUADRANTS = {
  // [up/down, left/right]
  NE: {
    // [+, +]
    neighbors: [
      [[1, -1], [1, 0], [1, 1]],
      [[0, -1], [0, 0], [0, 1]],
      [[-1, -1], [-1, 0], [-1, 1]]
    ],
    center: [0.5, 0.5],
    box: makeBoxArray([0, 1], [1, 1], [1, 0]),
    test (latitude, longitude) {
      return latitude > 0 && longitude > 0
    }
  },

  NW: {
    // [+, -]
    neighbors: [
      [[1, 1], [1, 0], [1, -1]],
      [[0, 1], [0, 0], [0, -1]],
      [[-1, 1], [-1, 0], [-1, -1]]
    ],
    center: [0.5, -0.5],
    box: makeBoxArray([0, -1], [1, -1], [1, 0]),
    test (latitude, longitude) {
      return latitude > 0 && longitude < 0
    }
  },

  SW: {
    // [-, -]
    neighbors: [
      [[-1, -1], [-1, 0], [-1, 1]],
      [[0, -1], [0, 0], [0, 1]],
      [[1, -1], [1, 0], [1, 1]]
    ],
    center: [-0.5, -0.5],
    box: makeBoxArray([0, -1], [-1, -1], [-1, 0]),
    test (latitude, longitude) {
      return latitude < 0 && longitude < 0
    }
  },

  SE: {
    // [-, +]
    neighbors: [
      [[-1, 1], [-1, 0], [-1, -1]],
      [[0, 1], [0, 0], [0, -1]],
      [[1, 1], [1, 0], [1, -1]]
    ],
    center: [-0.5, 0.5],
    box: makeBoxArray([0, 1], [-1, 1], [-1, 0]),
    test (latitude, longitude) {
      return latitude < 0 && longitude > 0
    }
  }
}

class Geo {
  constructor (latitude, longitude) {
    if (latitude && !longitude && Array.isArray(latitude)) {
      // Only an array was passed in so use values from that
      longitude = latitude[1]
      latitude = latitude[0]
    } else if (latitude && !longitude && typeof latitude === 'string') {
      // Only a string was passed in so split values from that by comma
      longitude = latitude.split(',')[1]
      latitude = latitude.split(',')[0]
    } else if (latitude && !longitude && typeof latitude === 'object') {
      // Only an object was passed in so look for keys
      longitude = latitude.longitude || latitude.long || latitude.lon
      latitude = latitude.latitude || latitude.lat
    }

    this.latitude = Number(latitude)
    this.longitude = Number(longitude)
  }

  getQuadrant () {
    for (const quadrant of Object.keys(QUADRANTS)) {
      if (QUADRANTS[quadrant].test.apply(null, this.toArray())) {
        return quadrant
      }
    }
  }

  toString () {
    return this.toArray().join(',')
  }

  toArray () {
    return [this.latitude, this.longitude]
  }

  toObject () {
    const {latitude, longitude} = this
    return {latitude, longitude}
  }

  getGraticule () {
    return this.toArray().map((val) => parseInt(val, 10))
  }

  getNeighboringGraticules () {
    const graticule = this.getGraticule()
    const ag = partial(addArray, graticule)
    const {neighbors} = QUADRANTS[this.getQuadrant()]
    return [
      [ag(neighbors[0][0]), ag(neighbors[0][1]), ag(neighbors[0][2])],
      [ag(neighbors[1][0]), ag(neighbors[1][1]), ag(neighbors[1][2])],
      [ag(neighbors[2][0]), ag(neighbors[2][1]), ag(neighbors[2][2])]
    ]
  }

  getNeighboringGraticuleBoxes () {
    return this.getNeighboringGraticules().map((row) => {
      return row.map((graticule) => new Geo(graticule).getGraticuleBox())
    })
  }

  pointWithinGraticule (latitude, longitude) {
    // Parse the inputted point and map to a string and make sure
    // to remove any leading numbers before the decimal point
    const point = new Geo(latitude, longitude).toArray().map(String).map((value) => '.' + value.split('.')[1])
    // Depending on the number of decimals, we could lose precision if we just tried to add these
    // so thats why we are doing it all as string concatention
    return this.getGraticule().map(String).map((value, index) => value + point[index]).map(Number)
  }

  getGraticuleCenter () {
    const graticule = this.getGraticule()
    return QUADRANTS[this.getQuadrant()].center.map((val, index) => graticule[index] + val)
  }

  getGraticuleBox () {
    const [latitude, longitude] = this.getGraticule()
    return QUADRANTS[this.getQuadrant()].box.map((indices) =>
      [latitude + indices[0], longitude + indices[1]]
    )
  }

  metersFrom (latitude, longitude) {
    const point = new Geo(latitude, longitude)
    return distance.vincentySync(this.toObject(), point.toObject())
  }

  kilometersFrom () {
    return this.metersFrom.apply(this, arguments) / 1000
  }

  milesFrom () {
    return this.metersFrom.apply(this, arguments) * 0.000621371
  }

  isW30 () {
    return this.longitude > -30
  }
}

export default Geo
