const dbg = require('debug')('phoner');

const specCharsInNumsRegex = /[-()]+/g;
const spaceInNumsRegex = /(\d)\s+(\d)/g;
const phoneRegex = /(^|[^\d])(\d{10,})($|[^\d])/g;

// Finds phones in text and returns numbers array
exports.find = (t) => {
    let phones = [];

    // Remove characters that could be in a number, so extracting numbers could be easier
    t = t.replace(specCharsInNumsRegex, '').replace(spaceInNumsRegex, '$1$2');
    dbg(`text after cleanup: ${t}`)

    let a;
    // find all phones and add them to array if they start with national or country code
    while((a = phoneRegex.exec(t)) !== null) {
        const phone = a[2];

        if (phone.startsWith('380') || phone.startsWith('0')) {
            dbg(`phone found: ${phone}`);
            phones.push(phone);
        } else {
            dbg(`ignored number: ${phone}`);
        }
    }

    return phones;
};
