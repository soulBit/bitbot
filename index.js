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
                    "symbolURL": "https://api.bitfinex.com/v1/symbols_details/",
                    "symbolPropName": "pair",
                    "tickerURL": "https://www.bitstamp.net/api/v2/ticker/",
                    "tickerPropName": "last"
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
    console.log("Attempting to execute command '" + msg.content.toString() + "'.");
    if (msg.content === "!update")
    {
        Object.keys(exchanges).forEach(function(key) {
            var val = exchanges[key];
            updateExchangeData(val.symbolURL).then(function(body){
                symbols[key] = [];
                body.forEach(function(item) {
                    symbols[key].push(item[val.symbolPropName]);
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
        if (content.length !== 3)
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
        for (var key in symbols[targetExchange])
        {
            console.log(key + ":" + targetPair);
            if (key == targetPair)
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
    // var content = msg.content.split(" ");
    // if (content[0] == "!price") {
    //     var currPair = content[1];
    //     if (typeof currPair !== "undefined" && currPair !== null)
    //     {
    //         var found = false;
    //         for (var i = 0; i < pairs.length; i++)
    //         {
    //             if (currPair == pairs[i])
    //             {
    //                 found = true;
    //                 break;
    //             }
    //         }

    //         if (!found)
    //         {
    //             msg.reply("Market '" + currPair + "' not found. Please try one of the following: '" + pairs.join("','") + "'.");
    //             return;
    //         }

    //         https.get(url + currPair, res => {
    //         	res.setEncoding("utf8");
    //         	let body = "";
    //         	res.on("data", data => {
    //         		body += data;
    //         	});
    //         	res.on("end", () => {
    //         		body = JSON.parse(body);
    //         		msg.reply("Latest Bitstamp price for '" + currPair + "': " + pairSymbol[i] + `${body.last}`);
    //         	});
    //         });
    //     }
    //     else
    //     {
    //         msg.reply("Use !price <market_name> with one of the following markets: '" + pairs.join("','") + "'. ");
    //         return;
    //     }
    // }
});

client.login(process.env.TOKEN);