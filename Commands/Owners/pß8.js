const Data = require('pro.db');
const { owners } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "عطه",
    description: "إعطاء رصيد لعضو معين",
    run: async (client, message, args) => {
        // التحقق من أن المستخدم مدير البنك أو المدير الأسبوعي
        if (!owners.includes(message.author.id) && message.author.id !== await Data.get(`weeklyManager_${message.guild.id}`)) 
            return message.react("❌");

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply("يرجى إرفاق منشن العضو الذي تريد إعطائه رصيد");

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) // التحقق من أن المبلغ صالح
            return message.react("❎");

        if (message.author.id === await Data.get(`weeklyManager_${message.guild.id}`) && amount > 1000000) // التحقق من أن المدير الأسبوعي لا يمكنه إعطاء مبلغ يتجاوز المليون
            return message.react("❎");

        await Data.add(`money_${targetUser.id}`, amount);

        message.react("✅");

        // تسجيل اللوج
        const logChannelId = await Data.get(`logChannel_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setTitle("تحديث رصيد")
                .setDescription(`**تم إعطاء ${amount.toLocaleString('en-US')}$ إلى <@${targetUser.id}>
                 من قبل : <@${message.author.id}>**`)
                .addField("المبلغ", `${amount.toLocaleString('en-US')}$`)
                .setThumbnail('https://l.top4top.io/p_3127zblgh1.png')
                .setColor("#01b8ff")
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

            logChannel.send({ embeds: [logEmbed] });
        }
    }
};