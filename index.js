// Discord.js bot
//TODO: implement more exchanges
//TODO: add more currency pair symbols for bitfinex pairs
//TODO: automatically update exchange data every 24 hours
//TODO: error handling when exchange url is unavailable

//https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
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
        "decodeSymbols": function(obj, exchange) {
            obj.forEach(function(item) {
                symbols[exchange].push(item["url_symbol"]);
            });
        },
        "tickerURL": "https://www.bitstamp.net/api/v2/ticker/",
        "tickerPropName": "last",
        "getPriceSymbol": function(symbol) {
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
        "decodeSymbols": function(obj, exchange) {
            obj.forEach(function(item) {
                symbols[exchange].push(item);
            });
        },
        "tickerURL": "https://api.bitfinex.com/v1/ticker/",
        "tickerPropName": "last_price",
        "getPriceSymbol": function(symbol) {
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
    "binance": {
        "fullName": "Binance",
        "symbolURL": "https://api.binance.com/api/v1/exchangeInfo",
        "decodeSymbols": function(obj, exchange) {
            obj.symbols.forEach(function(item) {
                symbols[exchange].push(item.symbol);
            });
        },
        "tickerURL": "https://api.binance.com/api/v3/ticker/price?symbol=",
        "tickerPropName": "price",
        "getPriceSymbol": function(symbol){
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

function sendMessage(msg, channel)
{
    if (msg.length >= 2000)
    {
        msg = msg.match(/.{1,1500}/g);
        for (var i = 0; i < msg.length; i++)
            channel.send(msg[i]);
    }
    else
        channel.send(msg);
}

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
        var exchange = exchanges[key];
        updateExchangeData(exchange.symbolURL).then(function(body){
            symbols[key] = [];
            exchange.decodeSymbols(body, key);
            if (msg)
                msg.channel.send(exchange.fullName + " markets updated: '" + symbols[key].join("', '") + "'.");
            console.log(exchange.fullName + " markets updated: '" + symbols[key].join("', '") + "'.");
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
        var helpString = `Possible commands:
        "!price <exchange> <currency_pair>" returns the current market price for <currency_pair> from <exchange>. Possible exchanges are: ${exchangeStr}.
        "!market <exchange>" returns the list of possible currency pairs that can be queried from <exchange>. Possible exchanges are: ${exchangeStr}.
        `;
        sendMessage(helpString, msg.channel);
        return;
    }

    if (content[0] == "!market")
    {
        var marketError = "Use !market <exchange> with one of the following exchanges: " + exchangeStr + ".";
        if (content.length < 2)
        {
            sendMessage(marketError, msg.channel);
            return;
        }
        var targetExchange = content[1];
        if (typeof targetExchange === "undefined" || targetExchange === null)
        {
            sendMessage(marketError, msg.channel);
            return;
        }
        if (typeof exchanges[targetExchange] === "undefined" || !exchanges[targetExchange])
        {
            sendMessage("Exchange '" + targetExchange + "' not found. " + marketError, msg.channel);
            return;
        }
        sendMessage("Currency pairs for " + exchanges[targetExchange].fullName + ": '" + symbols[targetExchange].join("', '") + "'.", msg.channel);
        return;
    }

    if (content[0] == "!price")
    {
        var priceError = "Use !price <exchange> <currency_pair> with one of the following exchanges: " + exchangeStr + ". ";
        if (content.length < 3)
        {
            sendMessage(priceError, msg.channel);
            return;
        }

        var targetExchange = content[1];
        if (typeof targetExchange === "undefined" || targetExchange === null)
        {
            sendMessage(priceError, msg.channel);
            return;
        }
        if (typeof exchanges[targetExchange] === "undefined" || !exchanges[targetExchange])
        {
            sendMessage("Exchange '" + targetExchange + "' not found. " + priceError, msg.channel);
            return;
        }

        var targetPair = content[2];
        if (typeof targetPair === "undefined" || targetPair === null)
        {
            //add code to check if valid exchange
            sendMessage("No currency pair specified. " + priceError, msg.channel);
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
            sendMessage("Currency pair '" + targetPair + "' not present for '" + targetExchange + "'. Please use one of the following: '" + symbols[targetExchange].join("', '") + "'. ", msg.channel);
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

                var priceSymbol = exchanges[targetExchange].getPriceSymbol(targetPair.substr(-3));
                sendMessage(`Latest ${exchanges[targetExchange].fullName} price for '${targetPair}': ${priceSymbol}${body[exchanges[targetExchange].tickerPropName]}`, msg.channel);
            });
        });
    }
});

client.login(process.env.TOKEN);