// Discord.js bot
const Discord = require('discord.js');
const https = require('https');

var symbols = {};
const client = new Discord.Client();
const exchanges = {"bitstamp": {
                    "fullName": "Bitstamp",
                    "symbolURL": "https://www.bitstamp.net/api/v2/trading-pairs-info/",
                    "symbolPropName": "url_symbol",
                    "tickerURL": "https://www.bitstamp.net/api/v2/ticker/",
                    "tickerPropName": "last"
                   },
                   "bitfinex": {
                    "fullName": "BitFinex",
                    "symbolURL": "https://api.bitfinex.com/v1/symbols/",
                    "symbolPropName": "",
                    "tickerURL": "https://api.bitfinex.com/v1/ticker/",
                    "tickerPropName": "last_price"
                   }};


function updateExchangeData(exchange){
    return new Promise(function(resolve, reject) {
        var req = https.get(exchange, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }

            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("end", () => {
                try {
                    body = JSON.parse(body);
                } catch(e) {
                    reject(e);
                }
                resolve(body);
            });
        });
        // reject on request error
        req.on('error', function(err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });   
    });
}

// const pairs = ["btcusd", "btceur", "eurusd", "xrpusd", "xrpeur", "xrpbtc", "ltcusd", "ltceur", "ltcbtc", "ethusd", "etheur", "ethbtc", "bchusd", "bcheur", "bchbtc"];
// const pairSymbol = ["$", "€", "$", "$", "€", "BTC", "$", "€", "BTC", "$", "€", "BTC", "$", "€", "BTC" ];

//https://www.bitstamp.net/api/
//https://docs.bitfinex.com/v2/docs/ws-general#section-supported-pairs

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    //console.log("Attempting to execute command '" + msg.content.toString() + "'.");
    if (msg.content === "!update")
    {
        Object.keys(exchanges).forEach(function(key) {
            var val = exchanges[key];
            updateExchangeData(val.symbolURL).then(function(body){
                symbols[key] = [];
                body.forEach(function(item) {
                    if (val.symbolPropName.length > 0)
                        symbols[key].push(item[val.symbolPropName]);
                    else
                        symbols[key].push(item);
                });
                msg.reply(val.fullName + " markets updated: '" + symbols[key].join("', '") + "'.");
                console.log(val.fullName + " markets updated: '" + symbols[key].join("', '") + "'.");
            });
        });
        
        return;
    }

    // if (msg.content === "!help")
    // {
    //     msg.reply("Use !price <exchange> <currency_pair> with one of the following exchanges: '" + pairs.join("','") + "'. ");
    //     return;
    // }

    var content = msg.content.split(" ");
    if (content[0] == "!price")
    {
        if (content.length < 3)
        {
            msg.reply("Use !price <exchange> <currency_pair> with one of the following exchanges: '" + Object.keys(exchanges).join("', '") + "'. ");
            return;
        }

        var targetExchange = content[1];
        var targetPair = content[2];
        if (typeof targetExchange === "undefined" || targetExchange === null)
        {
            //add code to check if valid exchange
            msg.reply("you messed up, no exchange specified");
            return;
        }
        if (typeof targetPair === "undefined" || targetPair === null)
        {
            //add code to check if valid exchange
            msg.reply("you messed up, no currency pair specified");
            return;
        }

        var isSupported = false;
        for (var i = 0; i < symbols[targetExchange].length; i++)
        {
            if (!symbols[targetExchange][i])
                continue;
            
            //console.log(symbols[targetExchange][i] + ":" + targetPair);

            if (symbols[targetExchange][i] == targetPair)
            {
                isSupported = true;
                break;
            }
        }

        if (!isSupported)
        {
            msg.reply("Currency pair '" + targetPair + "' not present for '" + targetExchange + "'. Please use one of the following: '" + symbols[targetExchange].join("', '") + "'. ");
            return;
        }
        console.log("Attempting to load url: '" + exchanges[targetExchange].tickerURL + targetPair + "'.");
        https.get(exchanges[targetExchange].tickerURL + targetPair, res => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("end", () => {
                body = JSON.parse(body);
                msg.reply("Latest " + exchanges[targetExchange].fullName + " price for '" + targetPair + "': " + "? " + `${body[exchanges[targetExchange].tickerPropName]}`);
            });
        });
    }
});

client.login(process.env.TOKEN);