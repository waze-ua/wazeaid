'use strict';

let http = require('http');
let config = require('./../config.js');

exports.run = () => {
    http.get(config.scanner.url, );
};