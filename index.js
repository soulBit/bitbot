// Discord.js bot
const Discord = require('discord.js');
const https = require('https');

const client = new Discord.Client();
const url = "https://www.bitstamp.net/api/v2/ticker/";
const pairs = ["btcusd", "btceur", "eurusd", "xrpusd", "xrpeur", "xrpbtc", "ltcusd", "ltceur", "ltcbtc", "ethusd", "etheur", "ethbtc", "bchusd", "bcheur", "bchbtc"];
const pairSymbol = ["$", "€", "$", "$", "€", "", "$", "€", "", "$", "€", "", "$", "€", "" ];

//https://www.bitstamp.net/api/
//TODO: add currency pairs - 

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '!ping') {
        msg.reply('pong!');
        return;
    }

    if (msg.content === "!markets")
    {
        msg.reply("Use !price <market_name> with one of the following markets: " + pairs.join("','") + ". ");
        return;
    }

    var content = msg.content.split(" ");
    if (content[0] == "!price") {
        var currPair = content[1];
        if (typeof currPair !== "undefined" && currPair !== null)
        {
            var found = false;
            for (var i = 0; i < pairs.length; i++)
            {
                if (currPair == pairs[i])
                {
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                msg.reply("Currency pair '" + currPair + "' not found. Please try one of the following: " + pairs.join("','"));
                return;
            }

            https.get(url + currPair, res => {
            	res.setEncoding("utf8");
            	let body = "";
            	res.on("data", data => {
            		body += data;
            	});
            	res.on("end", () => {
            		body = JSON.parse(body);
            		msg.reply("Latest Bitstamp price for " + currPair + ": " + pairSymbol[i] + `${body.last}`);
            	});
            });
        }
        else
        {
            msg.reply("Use !price <market_name> with one of the following markets: " + pairs.join("','") + ". ");
            return;
        }
    }
});

client.login(process.env.TOKEN);