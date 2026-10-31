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
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });

            logChannel.send({ embeds: [logEmbed] });
        }
    }
};