// Discord.js bot
const Discord = require('discord.js');
const https = require('https');
const request = require('request');

const client = new Discord.Client();
const exchanges = {"bitstamp": {
                    "symbolURL": "https://www.bitstamp.net/api/v2/trading-pairs-info/",
                    "tickerURL": "https://www.bitstamp.net/api/v2/ticker/"
                   },
                   "bitfinex": {
                    "symbolURL": "https://api.bitfinex.com/v1/symbols_details/",
                    "tickerURL": "https://www.bitstamp.net/api/v2/ticker/"
                   }];
var symbols = {};

function getBitstampData(){
    return new Promise(function(resolve, reject) {
        var req = https.get(exchanges.bitstamp.symbolURL, res => {
            // if (res.statusCode < 200 || res.statusCode >= 300) {
            //     return reject(new Error('statusCode=' + res.statusCode));
            // }

            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("end", () => {
                // body = JSON.parse(body);
                // //msg.reply("Latest Bitstamp price for '" + currPair + "': " + pairSymbol[i] + `${body.last}`);
                // symbols.bitstamp = [];
                // body.forEach(function(symbol) {
                //     symbols.bitstamp.push(symbol.url_symbol);
                // });
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



// const url = "https://www.bitstamp.net/api/v2/ticker/";
// const pairs = ["btcusd", "btceur", "eurusd", "xrpusd", "xrpeur", "xrpbtc", "ltcusd", "ltceur", "ltcbtc", "ethusd", "etheur", "ethbtc", "bchusd", "bcheur", "bchbtc"];
// const pairSymbol = ["$", "€", "$", "$", "€", "BTC", "$", "€", "BTC", "$", "€", "BTC", "$", "€", "BTC" ];
//https://www.bitstamp.net/api/

//TODO: add bitfinex and others
//https://docs.bitfinex.com/v2/docs/ws-general#section-supported-pairs

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === "!update")
    {
        getBitstampData().then(function(body){
            symbols.bitstamp = [];
            body.forEach(function(symbol) {
                symbols.bitstamp.push(symbol.url_symbol);
            });
            msg.reply("Bitstamp markets updated: '" + symbols.bitstamp.join("','") + "'. ");
        });
    }

    // if (msg.content === "!help")
    // {
    //     msg.reply("Use !price <market_name> with one of the following markets: '" + pairs.join("','") + "'. ");
    //     return;
    // }

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