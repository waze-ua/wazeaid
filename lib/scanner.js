'use strict';

let http = require('http');
let _ = require('lodash');

let config = require('./../config.js');
let mailer = require('./mailer.js');

// Holds pairs: reported UUID with timestamp of report
let reported = {};

exports.run = () => {
    let sosdata = null;

    http.get(config.scanner.url, (resp) => {
        if (resp.statusCode !== 200) {
            console.error(`HTTP status: ${resp.statusCode}`);
            resp.resume();
            schedule();
            return;
        }

        let rawJSON = '';
        resp.on('data', (chunk) => {rawJSON += chunk;});
        resp.on('end', () => {
            try {
                sosdata = JSON.parse(rawJSON);
            } catch(e) {
                console.error(e.message);
                schedule();
                return;
            }

            if (sosdata.alerts !== undefined) {
                _.each(sosdata.alerts, (e) => {
                    if (e.country !== 'UP' || e.type !== 'SOS' || reported[e.uuid] !== undefined)
                        return;

                    let alertData = {
                        type: e.subtype,
                        latitude: e.location.x,
                        longitude: e.location.y,
                        text: e.reportDescription,
                        time: e.pubMillis
                    };

                    mailer.send(alerdData);
                });
            }

            clearExpired();
            schedule();
        });
    });
};

let schedule = () => { setTimeout(exports.run, config.scanner.interval); };

let clearExpired = () => {};