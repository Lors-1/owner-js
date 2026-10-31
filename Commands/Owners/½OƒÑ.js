const Data = require('pro.db');
const { MessageEmbed } = require('discord.js');
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "سماح",
    description: "يقوم بفك منع الأشخاص المحظورين من القيام بشيء معين.",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        let mentionedUser;

        if (message.mentions.users.size > 0) {
            mentionedUser = message.mentions.users.first();
        } else {
            const userId = args[0];
            if (!userId) return message.reply("**يرجى إرفاق منشن الشخص أو الآيدي**");

            mentionedUser = await client.users.fetch(userId);
            if (!mentionedUser) return message.reply("❌ لم أتمكن من العثور على المستخدم.");
        }

        const isBlocked = await Data.get(`blocked_${mentionedUser.id}`);
        if (!isBlocked) return message.react("🤔");

        await Data.delete(`blocked_${mentionedUser.id}`);

        message.react("☑️");

        // تسجيل اللوج
        const logChannelId = await Data.get(`logChannel_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setTitle("رفع المنع")
                .setDescription(`**تم رفع الحظر عن المستخدم <@${mentionedUser.id}> 
                    من قبل : <@${message.author.id}>**`)
                .setThumbnail('https://c.top4top.io/p_3127tx5jo1.png')
               
                .setColor("#01b8ff")
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });
        
            logChannel.send({ embeds: [logEmbed] });
        }        
    }
};
