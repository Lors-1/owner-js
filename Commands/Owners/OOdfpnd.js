const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Data = require('pro.db');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "ممنوعين",
    description: "يعرض قائمة الأشخاص الممنوعين من القيام بشيء معين.",
    run: async (client, message, args) => {

        if (!owners.includes(message.author.id)) return message.react('');

        const overlayColor = Data.get(`bankcolor-${message.guild.id}`)
        fs.readFile('database.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            }

            const database = JSON.parse(data);

            const blockedUsers = Object.keys(database)
                .filter(key => key.startsWith("blocked_"))
                .map((key, index) => `\`#${index + 1}\` <@${key.split("_")[1]}>`);

            if (blockedUsers.length === 0) {
                return message.reply("**سيرفر مُسالم مافيش حد ممنوع لحد الآن.**");
            }

            const blockedUserList = blockedUsers.join("\n");

            const embed = new MessageEmbed()
                .setColor(overlayColor)
                .setDescription(`${blockedUserList}`);
            message.reply({ embeds: [embed] });
        });
    }
};
