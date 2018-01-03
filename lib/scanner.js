'use strict';

const dbg = require('debug')('scanner'); 
let https = require('https');
let _ = require('lodash');

let config = require('./../config');
let mailer = require('./mailer');
let phoner = require('./phoner');

// Holds pairs: reported UUID with timestamp of report
let reported = {};

exports.run = () => {
    let sosdata = null;

    dbg('get waze alerts');

    https.get(config.scanner.url, (resp) => {
        dbg('waze response');
    
        if (resp.statusCode !== 200) {
            console.error(`HTTP status: ${resp.statusCode}`);
            resp.resume();
            schedule();
            return;
        }

        let rawJSON = '';
        resp.on('data', (chunk) => rawJSON += chunk);
        resp.on('end', () => {
            dbg('got all data')
            try {
                sosdata = JSON.parse(rawJSON);

                if (sosdata.alerts !== undefined) {
                    _.each(sosdata.alerts, (a) => {
                        // Skip wrong country, alert type or already reported alerts
                        if (a.country !== 'UP' || a.type !== 'SOS' || reported[a.uuid] !== undefined) {
                            dbg('skipping unrelated alert');
                            return;
                        }

                        let phones = phoner.find(a.reportDescription);

                        dbg(`phones in alert: ${phones}`);
                
                        // Send email only when SOS message has at least one phone number
                        if (phones.length) {
                            dbg(`sending mail`);
                            mailer.send({
                                type: config.scanner.sostypes[a.subtype] || '???',
                                latitude: a.location.x,
                                longitude: a.location.y,
                                text: a.reportDescription,
                                time: Date(a.pubMillis).toString(),
                                phone: phones[0] // first phone will be main phone for contacts
                            });
                        }

                        // Store uuid as reported
                        reported[a.uuid] = a.pubMillis / 1000;
                    });
                }
            } catch(e) {
                console.error(e.message);
            }

            dbg('waze data processed');
            clearExpired();
            schedule();
        });
    });
};

// Schedule next request to Waze
let schedule = () => { setTimeout(exports.run, config.scanner.interval); };

// Clear expired UUIDs
let clearExpired = () => {
    const time = Math.floor(new Date() / 1000);
    let before = reported.length;
    reported = _.filter(reported, (k, v) => time < v + config.scanner.expire);
    dbg(`cleared ${before - reported.length} expired item(s)`);
};