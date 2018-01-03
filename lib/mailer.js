let fs = require('fs');
const dbg = require('debug')('mailer');
let mustache = require('mustache');
let nodemailer = require('nodemailer');

let config = require('./../config');

let smtptransport = nodemailer.createTransport({
    host: config.mailer.smtp.server,
    port: config.mailer.smtp.port,
    secure: true,
    auth: {
        user: config.mailer.smtp.login,
        pass: config.mailer.smtp.password
    }
});

exports.send = (d) => {
    dbg(`sending mail alert`);
    let template = fs.readFileSync(config.mailer.message.template, {encoding: 'utf-8'});
    let message = mustache.render(template, d);
    dbg(message);

    smtptransport.sendMail({
        from: config.mailer.message.from,
        to: config.mailer.message.to,
        subject: config.mailer.message.subject,
        html: message
    }, (e, i) => {
        if (e) {
            dbg('mail delivery failed');
            dbg(e);
            dbg(i);
        }
    });
};