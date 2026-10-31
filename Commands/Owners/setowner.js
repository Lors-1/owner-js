const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const db = require('pro.db');
const { prefix, owners: configOwners } = require(`${process.cwd()}/config`);

module.exports = {
  name: "setowner",
  description: "إضافة أو إزالة مالك من قائمة المالكين.",
  run: async (client, message, args) => {
    try {
      // تحميل إعدادات config.json
      let config = require(`${process.cwd()}/config.json`);

      // الحصول على لون الخادم
      const Color = await db.get(`Guild_Color_${message.guild.id}`) || message.guild.me.displayHexColor || '#01b8ff';
      if (!Color) return;

      // التحقق من أن المستخدم هو أحد المالكين
      if (!configOwners.includes(message.author.id)) return message.react('❌');

      // التحقق من صحة المستخدم
      let user = message.mentions.users.first() || client.users.cache.get(args[0]);
      if (!user) return message.reply("**يرجى إرفاق منشن للعضو أو معرفه.**");

      if (config.owners.includes(user.id)) {
        // إزالة الأونر إذا كان موجودًا
        const index = config.owners.indexOf(user.id);
        config.owners.splice(index, 1);

        fs.writeFile(`${process.cwd()}/config.json`, JSON.stringify(config, null, 4), (err) => {
          if (err) console.log(err);
        });
        message.react("✅");
        message.reply(`**تمت إزالة <@${user.id}> من قائمة المالكين.**`);
      } else {
        // إضافة الأونر إذا لم يكن موجودًا
        config.owners.push(user.id);

        fs.writeFile(`${process.cwd()}/config.json`, JSON.stringify(config, null, 4), (err) => {
          if (err) console.log(err);
        });
        message.react("✅");
        message.reply(`**تمت إضافة <@${user.id}> إلى قائمة المالكين.**`);
      }
    } catch (err) {
      message.reply(`حدث خطأ: \`\`\` ${err.message} \`\`\``);
    }
  },
};
