import distance from 'node-geo-distance'
import partial from 'lodash/function/partial'
import rest from 'lodash/array/rest'

const addArray = (arr) => (item, index) => item + arr[index]
const addArrayMapper = (arr, arr2) => arr.map(addArray(arr2))
const parseIntMapper = (val) => parseInt(val, 10)
const decimal = (value) => '.' + value.split('.')[1]

const QUADRANTS = {
  // [up/down, left/right]
  NE: {
    // [+, +]
    // -------------
    // |           |
    // |           |
    // |           |
    // |           |
    // |           |
    // | **        |
    // -------------
    neighbors: [
      [1, -1], [1, 0], [1, 1],
      [0, 1], [0, 0], [0, -1],
      [-1, -1], [-1, 0], [-1, 1]
    ],
    center: [0.5, 0.5],
    box: [[0, 1], [0, 0], [1, 0], [1, 1]],
    test (latitude, longitude) {
      return latitude > 0 && longitude > 0
    }
  },

  NW: {
    // [+, -]
    // -------------
    // |           |
    // |           |
    // |           |
    // |           |
    // |           |
    // |           |
    // ------------- **
    neighbors: [
      [1, 1], [1, 0], [1, -1],
      [0, -1], [0, 0], [0, 1],
      [-1, 1], [-1, 0], [-1, -1]
    ],
    center: [0.5, -0.5],
    box: [[0, 0], [0, -1], [1, -1], [1, 0]],
    test (latitude, longitude) {
      return latitude > 0 && longitude < 0
    }
  },

  SW: {
    // [-, -]
    // ------------- **
    // |           |
    // |           |
    // |           |
    // |           |
    // |           |
    // |           |
    // -------------
    neighbors: [
      [-1, -1], [-1, 0], [-1, 1],
      [0, 1], [0, 0], [0, -1],
      [1, -1], [1, 0], [1, 1]
    ],
    center: [-0.5, -0.5],
    box: [[-1, 0], [-1, -1], [0, -1], [0, 0]],
    test (latitude, longitude) {
      return latitude < 0 && longitude < 0
    }
  },

  SE: {
    // [-, +]
    // -------------
    // | **        |
    // |           |
    // |           |
    // |           |
    // |           |
    // |           |
    // -------------
    neighbors: [
      [-1, 1], [-1, 0], [-1, -1],
      [0, -1], [0, 0], [0, 1],
      [1, 1], [1, 0], [1, -1]
    ],
    center: [-0.5, 0.5],
    box: [[-1, 1], [-1, 0], [0, 0], [0, 1]],
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

  quadrant () {
    const [latitude, longitude] = this.toArray()
    const keys = Object.keys(QUADRANTS)
    for (let i = 0, m = keys.length; i < m; i++) {
      if (QUADRANTS[keys[i]].test(latitude, longitude)) {
        return keys[i]
      }
    }
  }

  quadrantData () {
    return QUADRANTS[this.quadrant()]
  }

  // ======================
  // Casting as certain values
  // ======================

  toString () {
    return this.toArray().join(',')
  }

  toArray () {
    return [this.latitude, this.longitude]
  }

  toJSON () {
    const {latitude, longitude} = this
    return {latitude, longitude}
  }

  _toGeo (latitude, longitude) {
    return latitude instanceof Geo ? latitude : new Geo(latitude, longitude)
  }

  // ======================
  // 8 neighboring graticules
  // ======================

  neighboringGraticules () {
    return this.quadrantData().neighbors.map(this._graticuleAdder())
  }

  neighboringGraticuleBoxes () {
    return this._neighboringGraticulesWith('graticuleBox')
  }

  neighboringGraticuleCenters () {
    return this._neighboringGraticulesWith('graticuleCenter')
  }

  neighboringGraticulePoints (latitude, longitude) {
    return this._neighboringGraticulesWith('pointWithinGraticule', latitude, longitude)
  }

  _neighboringGraticulesWith (method) {
    const args = rest(arguments)
    return this.neighboringGraticules().map((graticule) => {
      const geo = new Geo(graticule)
      return geo[method].apply(geo, args)
    })
  }

  // ======================
  // Individual graticule
  // ======================

  // Returns the integer values for the graticule for the point
  graticule () {
    return this.toArray().map(parseIntMapper)
  }

  // Returns the center of the graticule for the point
  graticuleCenter () {
    const graticule = this.graticule()
    return this.quadrantData().center.map(addArray(graticule))
  }

  // Return the corners of the graticule for ths point
  graticuleBox () {
    return this.quadrantData().box.map(this._graticuleAdder())
  }

  // Takes the decimals of the passed in geo and maps them within the graticule
  pointWithinGraticule () {
    const point = this._toGeo.apply(this, arguments).toArray().map(String).map(decimal)
    const graticule = this.graticule().map(String)
    // Depending on the number of decimals, we could lose precision if we just tried to add these
    // so thats why we are doing it all as string concatention
    return graticule.map(addArray(point)).map(Number)
  }

  _graticuleAdder () {
    return partial(addArrayMapper, this.graticule())
  }

  // ======================
  // Distance
  // ======================

  metersFrom () {
    const geo = this._toGeo.apply(this, arguments)
    return distance.vincentySync(this.toObject(), geo.toObject())
  }

  kilometersFrom () {
    return this.metersFrom.apply(this, arguments) / 1000
  }

  milesFrom () {
    return this.metersFrom.apply(this, arguments) * 0.000621371
  }

  // ======================
  // W30
  // ======================

  // Returns true if this point is east of the W30 line
  isW30 () {
    return this.longitude > -30
  }
}

export default Geo
