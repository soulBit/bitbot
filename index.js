// Discord.js bot
const Discord = require('discord.js');
const https = require('https');

const client = new Discord.Client();
const url = "https://www.bitstamp.net/api/ticker";

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!ping') {
    msg.reply('pong!');
  }
  if (msg.content === '!price') {
	https.get(url, res => {
		res.setEncoding("utf8");
		let body = "";
		res.on("data", data => {
			body += data;
		});
		res.on("end", () => {
			body = JSON.parse(body);
			// console.log(
			// `City: ${body.results[0].formatted_address} -`,
			// `Latitude: ${body.results[0].geometry.location.lat} -`,
			// `Longitude: ${body.results[0].geometry.location.lng}`
			// );
			msg.reply(`${body.last}`);
		});
	});
  }
});

client.login(process.env.TOKEN);