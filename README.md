geo-graticule
===================

[![Greenkeeper badge](https://badges.greenkeeper.io/lukekarrys/geo-graticule.svg)](https://greenkeeper.io/)

Helper for turning a geocode into information about its graticule.

I use this for [xkcd Geohashing](https://xkcd.com/426/).

[![NPM](https://nodei.co/npm/geo-graticule.png)](https://nodei.co/npm/geo-graticule/)
[![Build Status](https://travis-ci.org/lukekarrys/geo-graticule.png?branch=master)](https://travis-ci.org/lukekarrys/geo-graticule)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)


## Install

`npm install geo-graticule`


## Usage

```js
import Geo from 'geo-graticule'

const geo = new Geo(34.189, -110.8567)

geo.toString()      // '34.189,-110.8567'
get.toArray()       // [ 34.189, -110.8567 ]
get.toJSON()        // { latitude: 34.189, longitude: -110.8567 }

geo.quadrant()           // 'NW'
geo.graticule()          // [ 34, -110 ]
geo.graticuleCenter()    // [ 34.5, -110.5 ]
geo.graticuleBox()       // [ [ 34, -110 ], [ 34, -111 ], [ 35, -111 ], [ 35, -110 ] ]

geo.pointWithinGraticule(0.456, 0.2345) // [ 34.456, -110.2345 ]
```


## API

#### `new Geo(latitude, longitude)`

The constructor accepts numbers or strings for any of the values. It will also accept an object with keys `latitude|lat` and `longitude|long|lon` or an array of `[latitude, longitude]`.

#### Return values

All values returned (whether inside objects or arrays) from methods will be a `Number` (except for `toString`).


## Contributing

This is written in ES6 and compiled to ES5 using [`babel`](https://babeljs.io/). The code you require will come from the `lib/` directory which gets compiled from `src/` before each `npm publish`.


## Tests

`npm test`


## License

MIT
