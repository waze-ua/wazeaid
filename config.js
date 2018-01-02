'use strict';

exports.scanner = {
        url: "https://www.waze.com/row-rtserver/web/TGeoRSS?tk=community&atf=SOS&types=alerts&format=JSON&ma=600&mj=100&mu=100&left=23.910453&right=39.880017&bottom=46.053247&top=51.477441&_=1510071267374",
        interval: 5000
};

exports.mailer = {
        smtp: {
            login: "user",
            password: "password",
            server: "gmail.com",
            port: 995
        },
        message: {
            reciever: "waze@justservice.com.ua",
            subject: "Waze SOS",
            template: "message.tpl",
            types:{
                "SOS_NO_FUEL": "нет топлива",
                "SOS_FLAT_TIRE": "спущено колесо",
                "SOS_BATTERY_ISSUE": "разрядился аккумулятор",
                "SOS_MEDICAL_HELP": "медицинская помощь",
                "SOS_OTHER": "другое"
            }
        },
};
