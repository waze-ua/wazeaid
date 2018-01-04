wazeaid
=======

NodeJS server for sending SOS alerts from Waze to servicing companies.

Steps to run server:

1) Download and unpack files.
1) Run `npm install`.
1) Create `config.js` and `message.tpl` files from `*.examples.*`.
1) Modify `config.js` and `message.tpl` for your purposes.
1) Run `node lib/main.js`.

If something is going wrong, run `DEBUG=* node lib/main.js` and check error messages.