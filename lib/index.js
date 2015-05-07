'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _distance = require('node-geo-distance');

var _distance2 = _interopRequireDefault(_distance);

var _partial = require('lodash/function/partial');

var _partial2 = _interopRequireDefault(_partial);

var _rest = require('lodash/array/rest');

var _rest2 = _interopRequireDefault(_rest);

var addArray = function addArray(arr) {
  return function (item, index) {
    return item + arr[index];
  };
};
var addArrayMapper = function addArrayMapper(arr, arr2) {
  return arr.map(addArray(arr2));
};
var parseIntMapper = function parseIntMapper(val) {
  return parseInt(val, 10);
};
var decimal = function decimal(value) {
  return '.' + value.split('.')[1];
};

var QUADRANTS = {

  //  A friendly reminder luke, ಠ_ಠ
  //
  //  Latitude    :   up    /  down
  //  Longitude   :   left  /  right
  //
  //  All graticule box points in each quadrant will
  //  be an array indexed by the number in that corner
  //
  //  The "X" is the corner of the whole numbers for that graticule
  //
  //   -------------   -------------
  //   | 2       3 |   | 2       3 |
  //   |           |   |           |
  //   |     NW    |   |     NE    |
  //   |   [+, -]  |   |   [+, +]  |
  //   |           |   |           |
  //   | 1       0 |   | 1       0 |
  //   ------------X   X-------------
  //
  //   ------------X   X------------
  //   | 2       3 |   | 2       3 |
  //   |           |   |           |
  //   |     SW    |   |     SE    |
  //   |   [-, -]  |   |   [-, +]  |
  //   |           |   |           |
  //   | 1       0 |   | 1       0 |
  //   -------------   -------------

  NE: {
    neighbors: [[1, -1], [1, 0], [1, 1], [0, 1], [0, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1]],
    center: [0.5, 0.5],
    box: [[0, 1], [0, 0], [1, 0], [1, 1]],
    test: function test(latitude, longitude) {
      return latitude >= 0 && longitude >= 0;
    }
  },

  NW: {
    neighbors: [[1, 1], [1, 0], [1, -1], [0, -1], [0, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
    center: [0.5, -0.5],
    box: [[0, 0], [0, -1], [1, -1], [1, 0]],
    test: function test(latitude, longitude) {
      return latitude >= 0 && longitude <= 0;
    }
  },

  SW: {
    neighbors: [[-1, -1], [-1, 0], [-1, 1], [0, 1], [0, 0], [0, -1], [1, -1], [1, 0], [1, 1]],
    center: [-0.5, -0.5],
    box: [[-1, 0], [-1, -1], [0, -1], [0, 0]],
    test: function test(latitude, longitude) {
      return latitude <= 0 && longitude <= 0;
    }
  },

  SE: {
    neighbors: [[-1, 1], [-1, 0], [-1, -1], [0, -1], [0, 0], [0, 1], [1, 1], [1, 0], [1, -1]],
    center: [-0.5, 0.5],
    box: [[-1, 1], [-1, 0], [0, 0], [0, 1]],
    test: function test(latitude, longitude) {
      return latitude <= 0 && longitude >= 0;
    }
  }
};

var Geo = (function () {
  function Geo(latitude, longitude) {
    _classCallCheck(this, Geo);

    if (latitude && !longitude && Array.isArray(latitude)) {
      // Only an array was passed in so use values from that
      longitude = latitude[1];
      latitude = latitude[0];
    } else if (latitude && !longitude && typeof latitude === 'string') {
      // Only a string was passed in so split values from that by comma
      longitude = latitude.split(',')[1];
      latitude = latitude.split(',')[0];
    } else if (latitude && !longitude && typeof latitude === 'object') {
      // Only an object was passed in so look for keys
      longitude = latitude.longitude || latitude.long || latitude.lon;
      latitude = latitude.latitude || latitude.lat;
    }

    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
  }

  _createClass(Geo, [{
    key: 'quadrant',
    value: function quadrant() {
      var _toArray = this.toArray();

      var _toArray2 = _slicedToArray(_toArray, 2);

      var latitude = _toArray2[0];
      var longitude = _toArray2[1];

      var keys = Object.keys(QUADRANTS);
      for (var i = 0, m = keys.length; i < m; i++) {
        if (QUADRANTS[keys[i]].test(latitude, longitude)) {
          return keys[i];
        }
      }
    }
  }, {
    key: 'quadrantData',
    value: function quadrantData() {
      return QUADRANTS[this.quadrant()];
    }
  }, {
    key: 'toString',

    // ======================
    // Casting as certain values
    // ======================

    value: function toString() {
      return this.toArray().join(',');
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return [this.latitude, this.longitude];
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var latitude = this.latitude;
      var longitude = this.longitude;

      return { latitude: latitude, longitude: longitude };
    }
  }, {
    key: '_toGeo',
    value: function _toGeo(latitude, longitude) {
      return latitude instanceof Geo ? latitude : new Geo(latitude, longitude);
    }
  }, {
    key: 'neighboringGraticules',

    // ======================
    // 8 neighboring graticules
    // ======================

    value: function neighboringGraticules() {
      return this.quadrantData().neighbors.map(this._graticuleAdder());
    }
  }, {
    key: 'neighboringGraticuleBoxes',
    value: function neighboringGraticuleBoxes() {
      return this._neighboringGraticulesWith('graticuleBox');
    }
  }, {
    key: 'neighboringGraticuleCenters',
    value: function neighboringGraticuleCenters() {
      return this._neighboringGraticulesWith('graticuleCenter');
    }
  }, {
    key: 'neighboringGraticulePoints',
    value: function neighboringGraticulePoints(latitude, longitude) {
      return this._neighboringGraticulesWith('pointWithinGraticule', latitude, longitude);
    }
  }, {
    key: '_neighboringGraticulesWith',
    value: function _neighboringGraticulesWith(method) {
      var args = _rest2['default'](arguments);
      return this.neighboringGraticules().map(function (graticule) {
        var geo = new Geo(graticule);
        return geo[method].apply(geo, args);
      });
    }
  }, {
    key: 'graticule',

    // ======================
    // Individual graticule
    // ======================

    // Returns the integer values for the graticule for the point
    value: function graticule() {
      return this.toArray().map(parseIntMapper);
    }
  }, {
    key: 'graticuleCenter',

    // Returns the center of the graticule for the point
    value: function graticuleCenter() {
      var graticule = this.graticule();
      return this.quadrantData().center.map(addArray(graticule));
    }
  }, {
    key: 'graticuleBox',

    // Return the corners of the graticule for ths point
    value: function graticuleBox() {
      return this.quadrantData().box.map(this._graticuleAdder());
    }
  }, {
    key: 'pointWithinGraticule',

    // Takes the decimals of the passed in geo and maps them within the graticule
    value: function pointWithinGraticule() {
      var point = this._toGeo.apply(this, arguments).toArray().map(String).map(decimal);
      var graticule = this.graticule().map(String);
      // Depending on the number of decimals, we could lose precision if we just tried to add these
      // so thats why we are doing it all as string concatention
      return graticule.map(addArray(point)).map(Number);
    }
  }, {
    key: '_graticuleAdder',
    value: function _graticuleAdder() {
      return _partial2['default'](addArrayMapper, this.graticule());
    }
  }, {
    key: 'metersFrom',

    // ======================
    // Distance
    // ======================

    value: function metersFrom() {
      var geo = this._toGeo.apply(this, arguments);
      return _distance2['default'].vincentySync(this.toObject(), geo.toObject());
    }
  }, {
    key: 'kilometersFrom',
    value: function kilometersFrom() {
      return this.metersFrom.apply(this, arguments) / 1000;
    }
  }, {
    key: 'milesFrom',
    value: function milesFrom() {
      return this.metersFrom.apply(this, arguments) * 0.000621371;
    }
  }, {
    key: 'isW30',

    // ======================
    // W30
    // ======================

    // Returns true if this point is east of the W30 line
    value: function isW30() {
      return this.longitude > -30;
    }
  }]);

  return Geo;
})();

exports['default'] = Geo;
module.exports = exports['default'];