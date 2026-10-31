const Data = require('pro.db');
const { MessageEmbed } = require('discord.js');
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "خصم",
    description: "خصم مبلغ من رصيد عضو معين",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply("**يرجى إرفاق منشن الشخص والمبلغ.**");

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) return message.react("❎");

        const userBalance = await Data.get(`money_${targetUser.id}`);
        if (!userBalance || userBalance < amount) return message.reply("لا يمتلك العضو المبلغ الكافي في رصيده");

        await Data.subtract(`money_${targetUser.id}`, amount);

        message.react("☑️");

        // تسجيل اللوج
        const logChannelId = await Data.get(`logChannel_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setTitle("خصم رصيد")
                .setDescription(`**تم خصم مبلغ قدره (${amount.toLocaleString('en-US')})$ من رصيد العضو : <@${targetUser.id}> 
                 من قبل : <@${message.author.id}>**`)
                .addField("المبلغ", `${amount.toLocaleString('en-US')}$`)
                .setThumbnail('https://i.top4top.io/p_3127n27gz1.png')
               
                .setColor("#01b8ff")
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });
        
            logChannel.send({ embeds: [logEmbed] });
        }        
    }
};
