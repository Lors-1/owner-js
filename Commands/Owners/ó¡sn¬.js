const { MessageEmbed } = require('discord.js');
const Data = require('pro.db');
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "تصفير",
    description: "تصفير رصيد عضو في البنك",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply("**منشن الي تبي تصفرة**");

        // تصفير رصيد العضو
        await Data.set(`money_${targetUser.id}`, 0);

        message.react("☑️");

        // تسجيل اللوج
        const logChannelId = await Data.get(`logChannel_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setTitle("تصفير رصيد")
                .setDescription(`**تم تصفير رصيد : <@${targetUser.id}> 
                    من قبل : <@${message.author.id}>**`)
                .setThumbnail('https://e.top4top.io/p_31278dayn1.png')
               
                .setColor("#01b8ff")
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });
        
            logChannel.send({ embeds: [logEmbed] });
        }        
    }
};
