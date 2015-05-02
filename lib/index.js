'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

// Dealing with +/- geos
// Most methods return an array of two numbers
// This makes it easy to call toString on any return val

var _distance = require('node-geo-distance');

var _distance2 = _interopRequireDefault(_distance);

// TODO: get correct data for these quadrants
var QUADRANTS = {
  NE: {
    center: [0.5, -0.5],
    box: [[0, 0], [0, -1], [1, -1], [1, 0], [0, 0]]
  },

  NW: {
    center: [0.5, -0.5],
    box: [[0, 0], [0, -1], [1, -1], [1, 0], [0, 0]]
  },

  SW: {
    center: [0.5, -0.5],
    box: [[0, 0], [0, -1], [1, -1], [1, 0], [0, 0]]
  },

  SE: {
    center: [0.5, -0.5],
    box: [[0, 0], [0, -1], [1, -1], [1, 0], [0, 0]]
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
    }

    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
  }

  _createClass(Geo, [{
    key: 'getQuadrant',
    value: function getQuadrant() {
      var _toArray = this.toArray();

      var _toArray2 = _slicedToArray(_toArray, 2);

      var latitude = _toArray2[0];
      var longitude = _toArray2[1];

      if (latitude > 0 && longitude > 0) {
        return 'NE';
      }

      if (latitude > 0 && longitude < 0) {
        return 'NW';
      }

      if (latitude < 0 && longitude < 0) {
        return 'SW';
      }

      if (latitude < 0 && longitude > 0) {
        return 'SE';
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.toArray().join(',');
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return [Number(this.latitude), Number(this.longitude)];
    }
  }, {
    key: 'toObject',
    value: function toObject() {
      var latitude = this.latitude;
      var longitude = this.longitude;

      return { latitude: latitude, longitude: longitude };
    }
  }, {
    key: 'toGraticule',
    value: function toGraticule() {
      return this.toArray().map(function (val) {
        return parseInt(val, 10);
      });
    }
  }, {
    key: 'pointWithinGraticule',
    value: function pointWithinGraticule(latitude, longitude) {
      // Parse the inputted point and map to a string and make sure
      // to remove any leading numbers before the decimal point
      var point = new Geo(latitude, longitude).toArray().map(String).map(function (value) {
        return '.' + value.split('.')[1];
      });
      // Depending on the number of decimals, we could lose precision if we just tried to add these
      // so thats why we are doing it all as string concatention
      return this.toGraticule().map(String).map(function (value, index) {
        return value + point[index];
      }).map(Number);
    }
  }, {
    key: 'toGraticuleCenter',
    value: function toGraticuleCenter() {
      var graticule = this.toGraticule();
      return QUADRANTS[this.getQuadrant()].center.map(function (val, index) {
        return graticule[index] + val;
      });
    }
  }, {
    key: 'toGraticuleBox',
    value: function toGraticuleBox() {
      var _toGraticule = this.toGraticule();

      var _toGraticule2 = _slicedToArray(_toGraticule, 2);

      var latitude = _toGraticule2[0];
      var longitude = _toGraticule2[1];

      return QUADRANTS[this.getQuadrant()].box.map(function (indices) {
        return [latitude + indices[0], longitude + indices[1]];
      });
    }
  }, {
    key: 'metersFrom',
    value: function metersFrom(latitude, longitude) {
      var point = new Geo(latitude, longitude);
      return _distance2['default'].vincentySync(this.toObject(), point.toObject());
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
  }]);

  return Geo;
})();

exports['default'] = Geo;
module.exports = exports['default'];