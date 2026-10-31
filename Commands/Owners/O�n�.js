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
                    .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });
            
                logChannel.send({ embeds: [logEmbed] });
            }            
        } catch (error) {
            console.error(error);
        }
    }
};
