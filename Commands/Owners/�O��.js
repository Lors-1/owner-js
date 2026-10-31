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
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });
        
            logChannel.send({ embeds: [logEmbed] });
        }        
    }
};
