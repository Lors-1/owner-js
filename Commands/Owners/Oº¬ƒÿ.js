const Data = require('pro.db');
const { MessageEmbed } = require('discord.js');
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "المدير",
    description: "عرض قائمة المديرين الأسبوعيين.",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        try {
            const managerID = Data.get(`weeklyManager_${message.guild.id}`);
            if (!managerID) return message.reply("لا يوجد مدير أسبوعي معين حالياً.");

            const managerUser = await client.users.fetch(managerID);
            if (!managerUser) return message.reply("تعذر العثور على المستخدم.");

            const embed = new MessageEmbed()
                .setTitle("قائمة المدراء الأسبوعيين")
                .setDescription(`**المدير الحالي هو: <@${managerUser.id}>**`)
                .setThumbnail('https://l.top4top.io/p_3127vfwar1.png')
                .setColor("#01b8ff")
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply("حدث خطأ أثناء محاولة عرض قائمة المديرين.");
        }
    }
};
