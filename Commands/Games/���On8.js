const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Data = require('pro.db');

module.exports = {
  name: "حراميه",
  aliases: ["حرامية"],
  description: "عرض قائمة بأعلى 10 أشخاص قاموا بأكبر عدد من الأموال المسروقة",
  run: async (client, message, args) => {
    
    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    // جلب لون الإيمبد من قاعدة البيانات
    const colors = await Data.get(`bankcolor-${message.guild.id}`) || "#01b8ff"; // لون افتراضي

    try {
      const rawData = fs.readFileSync('database.json');
      const database = JSON.parse(rawData);
      const topThieves = Object.keys(database)
        .filter(key => key.startsWith("totalLoot"))
        .map(key => ({
          id: key.split('_')[1],
          totalLoot: database[key]
        }))
        .sort((a, b) => b.totalLoot - a.totalLoot)
        .slice(0, 10);
      
      if (topThieves.length === 0) {
        return message.reply("لم يحدث عملية نهب الى الأن");
      }
      
      const embed = new MessageEmbed()
        .setColor(colors) // استخدام اللون المستدعى من قاعدة البيانات
        .setThumbnail('https://a.top4top.io/p_3185s6fd11.png');

      let description = '';
      topThieves.forEach((thief, index) => {
        if (thief.id && thief.totalLoot) {
          description += `**\`#${index + 1}\` <@${thief.id}> 💼💰 ${thief.totalLoot.toLocaleString('en-US')}$**\n`;
        }
      });
      
      // التحقق من وجود بيانات لعرضها في Embed
      if (description) {
        embed.setDescription(description);
        message.reply({ embeds: [embed] });
      } else {
        // إذا لم يكن هناك بيانات، يمكن إرسال رسالة بديلة
        message.reply("لم يحدث عملية نهب الى الأن");
      }
    } catch (error) {
      console.error(error);
      message.reply("حدث خطأ أثناء محاولة جلب البيانات.");
    }
  },
};
