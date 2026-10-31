const fs = require('fs');
const Data = require('pro.db');
const { MessageEmbed } = require('discord.js');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "مدير",
    description: "تعيين شخص كمدير أسبوعي.",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        const mentionedUser = message.mentions.users.first();
        if (!mentionedUser) return message.reply("**يرجى إرفاق منشن مدير البنك الاسبوعي.**");

        try {
            const appointmentTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // أسبوع واحد
            await Data.set(`weeklyManager_${message.guild.id}`, mentionedUser.id);
            await Data.set(`managerAppointmentTime_${message.guild.id}`, appointmentTime);

            message.reply(`تم تعينك كمدير اسبوعي للبنك 🥳\n<@${mentionedUser.id}>`);

            setTimeout(async () => {
                await Data.delete(`weeklyManager_${message.guild.id}`);
                await Data.delete(`managerAppointmentTime_${message.guild.id}`);
            }, 7 * 24 * 60 * 60 * 1000);

            // هنا نضيف اللوج
            const logChannelId = await Data.get(`logChannel_${message.guild.id}`);
            const logChannel = message.guild.channels.cache.get(logChannelId);

            if (logChannel) {
                const logEmbed = new MessageEmbed()
                    .setTitle("تعيين مدير أسبوعي جديد")
                    .setDescription(`تم تعيين <@${mentionedUser.id}> كمدير أسبوعي للبنك`)
                    .addField("بواسطة", `<@${message.author.id}>`)
                    .setThumbnail('https://l.top4top.io/p_3127vfwar1.png')
                   
                    .setColor("#01b8ff")
                    .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });
            
                logChannel.send({ embeds: [logEmbed] });
            }            
        } catch (error) {
            console.error(error);
        }
    }
};
