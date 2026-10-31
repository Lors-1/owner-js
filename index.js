const { Client, Collection } = require("discord.js");
const { prefix, owners, Guild } = require(`${process.cwd()}/config`);
const { exec } = require('child_process');
const express = require('express');
const app = express();
const fs = require("fs");
const db = require('pro.db'); // تأكد من تعريف مكتبة pro.db

require("events").EventEmitter.defaultMaxListeners = 9999999;

const client = new Client({ intents: 32767 });
client.commands = new Collection();

app.get('/', (req, res) => {
  res.send('Hello Express app!');
});

app.listen(3000, () => {
  console.log('Server Started');
});

process.on("unhandledRejection", (reason, promise) => { return });
process.on("uncaughtException", (err, origin) => { return });
process.on('uncaughtExceptionMonitor', (err, origin) => { return });
process.on('multipleResolves', (type, promise, reason) => { return });

require('dotenv').config();
client.config = require(`${process.cwd()}/config`);
module.exports = client;

// Loading events
require("./events")(client);

// When the bot joins a new server
client.on('guildCreate', (guild) => {
  if (guild.id !== client.config.Guild) {
    guild.leave(); // Leave the guild if it's not the one specified
  }
});

// Bot login
client.login(client.config.token);

// When the bot is ready
client.once("ready", async () => {
  console.log(`Name : ${client.user.tag}\nPing : ${client.ws.ping}\nPrefix : ${client.prefix}\nID : ${client.user.id}\nServer : ${client.guilds.cache.size}\nMembers : ${client.users.cache.size}\nChannels : ${client.channels.cache.size}`);
  
  const botId = client.user.id;
  client.config.botId = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot`;

  // Write the config file to disk
  fs.writeFile(`${process.cwd()}/config.json`, JSON.stringify(client.config, null, 4), (err) => {
    if (err) console.error(err);
  });
  
  // Retrieve saved status from the database
  let savedStatus = db.get(`${client.guilds.cache.first().id}_status`);
  let statusMessage = savedStatus ? savedStatus : "FlatStore";
  
  client.user.setPresence({
    activities: [{ name: statusMessage, type: 'STREAMING', url: 'https://twitch.tv/FlatStore' }],
    status: 'online'
  });
});

// Handle incoming messages
client.on('messageCreate', async (message) => {
  if (!message?.channel?.guild || message.author.bot) return;

  const { MessageEmbed } = require('discord.js');

  // Command for setting the bot's status
  if (message.content.startsWith(prefix + 'setstatus')) {
    const isAllowed = owners.includes(message.author.id);
    if (!isAllowed) return;

    const args = message.content.split(" ").slice(1);
    if (args.length === 0) {
      return message.channel.send('> **قم بإدخال الرسالة.**');
    }

    const statusMessage = args.join(' ');
    client.user.setPresence({
      activities: [{ name: statusMessage, type: 'STREAMING', url: 'https://twitch.tv/FlatStore' }],
      status: 'online'
    });
    db.set(`${message.guild.id}_status`, statusMessage);
    return message.channel.send('> **تم تعيين الحاله للبوت بنجاح.**');
  }

  // Command to restart the bot
  if (message.content === `${prefix}restart`) {
    if (!owners.includes(message.author.id)) return message.react('❌');
    
    message.reply('جاري إعادة تشغيل البوت...').then(() => {
      shutdownBot(); // Stop the bot first
    });
  }
});

// Function to shutdown the bot
function shutdownBot() {
  console.log('إيقاف البوت...');
  client.destroy(); // Stop the bot properly
  
  // Wait a few seconds before restarting to ensure the bot is fully stopped
  setTimeout(() => {
    restartBot();
  }, 3000); // 3 seconds delay before restarting
}

// Function to restart the bot
function restartBot() {
  const restartScript = exec('node index.js'); // Run the bot again using exec

  restartScript.on('exit', (code) => {
    console.log(`Bot restarted with code ${code}`);
    process.exit();
  });

  restartScript.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  restartScript.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}
