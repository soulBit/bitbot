// Discord.js bot
const Discord = require('discord.js');
const https = require('https');

const client = new Discord.Client();
const url = "https://www.bitstamp.net/api/v2/ticker/btcusd/";

//https://www.bitstamp.net/api/
//TODO: add currency pairs - btcusd, btceur, eurusd, xrpusd, xrpeur, xrpbtc, ltcusd, ltceur, ltcbtc, ethusd, etheur, ethbtc, bchusd, bcheur, bchbtc

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);
// });

client.on('message', msg => {
  if (msg.content === '!ping') {
    msg.reply('pong!');
  }
  if (msg.content === '!btcprice') {
	https.get(url, res => {
		res.setEncoding("utf8");
		let body = "";
		res.on("data", data => {
			body += data;
		});
		res.on("end", () => {
			body = JSON.parse(body);
			msg.reply(`Latest Bitstamp price: \$${body.last}`);
		});
	});
  }
});

client.login(process.env.TOKEN);