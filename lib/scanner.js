'use strict';

const dbg = require('debug')('scanner');
const https = require('https');
const http = require('http');

let config = require('./../config');
let mailer = require('./mailer');
let phoner = require('./phoner');

// Holds pairs: reported UUID with timestamp of report
let reported = {};

exports.run = () => {
    let sosdata = null;

    dbg('get waze alerts');

    const isHttp = config.scanner.url.startsWith('http:');
    const isHttps = config.scanner.url.startsWith('https:');

    if (!isHttp && !isHttps)
        throw {name: 'Wrong protocol', message: 'Protocol must be http or https'};

    const h = isHttp ? http : https;

    h.get(config.scanner.url, (resp) => {
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
                    sosdata.alerts.forEach((a) => {
                        dbg(`alert: country=${a.country} type=${a.type} uuid=${a.uuid} type=${a.type} subtype=${a.subtype} desc="${a.reportDescription}"`);
                        // Skip wrong country, alert type or already reported alerts
                        if (a.country !== 'UP' || a.type !== 'SOS' || reported[a.uuid] !== undefined) {
                            dbg('skipped...');
                            return;
                        }

                        let description = a.reportDescription || '';
                        let phones = phoner.find(description);

                        // Send email only when SOS message has at least one phone number
                        if (phones.length) {
                            dbg(`phones in alert: ${phones}`);
                            dbg(`sending mail`);
                            const d = new Date(a.pubMillis);

                            mailer.send({
                                type: config.scanner.sostypes[a.subtype] || '???',
                                latitude: a.location.y,
                                longitude: a.location.x,
                                message: description,
                                time: `${d.getHours()}:${d.getMinutes()}`,
                                phone: phones[0] // first phone will be main phone for contacts
                            });
                        } else {
                            dbg('no phones in alert')
                        }

                        dbg('uuid stored');
                        // Store uuid as reported
                        reported[a.uuid] = Math.floor(a.pubMillis / 1000);
                        dbg(reported);
                    });
                }
            } catch(e) {
                console.error(`EXCEPTION: ${e.message}`);
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
    dbg(`cleanning expired reported uuids`);
    const time = Math.floor(new Date() / 1000);
    let notexpired = {};

    for (let k in reported) {
        if (reported.hasOwnProperty(k)) {
            const t = reported[k];
            dbg(`uuid=${k} time=${t}`);

            if (time < t + config.scanner.expire) {
                // Item not expired, save it
                notexpired[k] = t;
                dbg('uuid still valid');
            } else {
                dbg('uuid expired');
            }
        }
    }

    dbg(`cleared ${reported.length - notexpired.length} expired item(s)`);
    reported = notexpired;
};