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
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });
        
            logChannel.send({ embeds: [logEmbed] });
        }        
    }
};
