// Discord.js bot
//TODO: implement more exchanges
//TODO: add more currency pair symbols for bitfinex pairs
//TODO: automatically update exchange data every 24 hours

//API docs
//https://www.bitstamp.net/api/
//https://docs.bitfinex.com/v2/docs/ws-general#section-supported-pairs

const Discord = require('discord.js');
const https = require('https');

//format is as below -
//"exchangeName": ["btcusd", "xmrbtc"]
var symbols = {};

const client = new Discord.Client();
const priceSymbols = {
    "euro": "€",
    "dollar": "$",
    "bitcoin": "BTC",
    "monero": "XMR",
    "litecoin": "LTC",
    "ripple": "XRP",
    "ethereum": "ETH",
    "bitcoincash": "BCH"
};
const exchanges = {
    "bitstamp": {
        "fullName": "Bitstamp",
        "symbolURL": "https://www.bitstamp.net/api/v2/trading-pairs-info/",
        "symbolPropName": "url_symbol",
        "tickerURL": "https://www.bitstamp.net/api/v2/ticker/",
        "tickerPropName": "last",
        "symbolDecode": function(symbol) {
            if (typeof(symbol) === "undefined" || symbol === null || symbol === "")
                return "";

            switch(symbol) {
                case "eur":
                    return priceSymbols.euro;
                    break;
                case "usd":
                    return priceSymbols.dollar;
                    break;
                case "btc":
                    return priceSymbols.bitcoin;
                    break;
                case "ltc":
                    return priceSymbols.litecoin;
                    break;
                case "eth":
                    return priceSymbols.ethereum;
                    break;
                case "xrp":
                    return priceSymbols.ripple;
                    break;
                case "bch":
                    return priceSymbols.bitcoincash;
                    break;
                default:
                    return symbol.toUpperCase();
                    break;
            }
        }
    },
    "bitfinex": {
        "fullName": "BitFinex",
        "symbolURL": "https://api.bitfinex.com/v1/symbols/",
        "symbolPropName": "",
        "tickerURL": "https://api.bitfinex.com/v1/ticker/",
        "tickerPropName": "last_price",
        "symbolDecode": function(symbol) {
            if (typeof(symbol) === "undefined" || symbol === null || symbol === "")
                return "";

            switch(symbol) {
                case "eur":
                    return priceSymbols.euro;
                    break;
                case "usd":
                    return priceSymbols.dollar;
                    break;
                case "btc":
                    return priceSymbols.bitcoin;
                    break;
                case "ltc":
                    return priceSymbols.litecoin;
                    break;
                case "eth":
                    return priceSymbols.ethereum;
                    break;
                case "xrp":
                    return priceSymbols.ripple;
                    break;
                case "bch":
                    return priceSymbols.bitcoincash;
                    break;
                default:
                    return symbol.toUpperCase();
                    break;
            }
        }
    }
};


function updateExchangeData(exchange){
    console.log("Updating: " + exchange);
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
        req.on('error', function(err) {
            reject(err);
        });   
    });
}

function update(msg){
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
            if (msg)
                msg.reply(val.fullName + " markets updated: '" + symbols[key].join("', '") + "'.");
            console.log(val.fullName + " markets updated: '" + symbols[key].join("', '") + "'.");
        }, function(error){
            console.log(error);
        });
    });
}

//bind events
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    update();
});

client.on('message', msg => {
    var content = msg.content.split(" ");
    if (content[0].indexOf("!") == 0)
        console.log(content.join(" "));
    else
        return;

    var exchangeStr = "'" + Object.keys(exchanges).join("', '") + "'";

    if (content[0] === "!update")
    {
        update(msg);
        return;
    }

    if (msg.content === "!help")
    {
        
        var helpString = `
            Supported commands:
            !price <exchange> <currency_pair> - returns the current market price for <currency_pair> from <exchange>. Possible exchanges are: ${exchangeStr}.
            !market <exchange> - returns the list of possible currency pairs that can be queried from <exchange>. Possible exchanges are: ${exchangeStr}.
        `;
        msg.reply(helpString);
        return;
    }

    if (content[0] == "!market")
    {
        if (content.length < 2)
        {
            msg.reply("Use !market <exchange> with one of the following exchanges: " + exchangeStr + ". ");
            return;
        }
        var targetExchange = content[1];
        if (typeof targetExchange === "undefined" || targetExchange === null)
        {
            msg.reply("you messed up, no exchange specified");
            return;
        }
        msg.reply("Currency pairs for " + exchanges[targetExchange].fullName + ": '" + symbols[targetExchange].join("', '") + "'.");
        return;
    }

    if (content[0] == "!price")
    {
        if (content.length < 3)
        {
            msg.reply("Use !price <exchange> <currency_pair> with one of the following exchanges: " + exchangeStr + ". ");
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

                var priceSymbol = exchanges[targetExchange].symbolDecode(targetPair.substr(-3));
                msg.reply("Latest " + exchanges[targetExchange].fullName + " price for '" + targetPair + "': " + priceSymbol + `${body[exchanges[targetExchange].tickerPropName]}`);
            });
        });
    }
});

client.login(process.env.TOKEN);