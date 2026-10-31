const Data = require('pro.db');
const { MessageEmbed } = require('discord.js');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "حولات",
    description: "يفعل أو يعطل أمر التحويلات",
    run: async (client, message, args) => {
        // التحقق من أن المستخدم هو أحد المالكين
        if (!owners.includes(message.author.id)) {
            return message.react('❌');
        }

        // الحصول على اللون المخصص لقناة البنوك
        const overlayColor = await Data.get(`bankcolor-${message.guild.id}`) || '#01b8ff'; // افتراضي إذا لم يتم العثور على اللون
        const isEnabled = await Data.get(`transformation_${message.guild.id}`);

        // التحقق من الأوامر
        if (args[0] === "تفعيل") {
            if (isEnabled === true) {
                return message.react("✅");
            }

            await Data.set(`transformation_${message.guild.id}`, true);
        } else if (args[0] === "تعطيل") {
            if (isEnabled === false) {
                return message.react("☑️");
            }

            await Data.set(`transformation_${message.guild.id}`, false);
        } else {
            // عرض رسالة توجيهية عند إدخال أمر غير صحيح
            const embed = new MessageEmbed()
                .setColor(overlayColor)
                .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة.\n${prefix}حولات تفعيل/تعطيل**`);
            message.reply({ embeds: [embed] });
        }
    },
};
