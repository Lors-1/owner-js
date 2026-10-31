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
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply("حدث خطأ أثناء محاولة عرض قائمة المديرين.");
        }
    }
};
