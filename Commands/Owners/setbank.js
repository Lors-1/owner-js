const Data = require('pro.db');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
name: "setbank",
description: "تعيين قناة ليتم فيها عرض أوامر البنك",
run: async (client, message, args) => {

if (!owners.includes(message.author.id)) return message.react('');

let channel = message.mentions.channels.first() || 
message.guild.channels.cache.get(args[0]) || 
message.guild.channels.cache.find(c => c.name === args[0]);

if (!channel) channel = message.channel;

await Data.set(`chatbank_${message.guild.id}`, channel.id);
message.react("☑️");
}
};