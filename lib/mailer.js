let fs = require('fs');
const dbg = require('debug')('mailer'); 
let mustache = require('mustache');
let nodemailer = require('nodemailer');

let config = require('./../config');

let smtptransport = nodemailer.createTransport({
    host: config.mailer.smtp.host,
    port: config.mailer.smtp.port,
    secure: true,
    auth: {
        user: config.mailer.smtp.login,
        pass: config.mailer.smtp.password
    }
});

exports.send = (d) => {
    dbg(`sending mail alert`);
    let template = fs.readFileSync(config.mailer.message.template);
    let message = mustache.render(template, d);
    dbg(`alert message: ${message}`);
};