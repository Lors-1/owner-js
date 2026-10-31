const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Data = require('pro.db');

module.exports = {
  name: "توب",
  description: "عرض قائمة بأغنى 10 أشخاص",
  run: async (client, message, args) => {
    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    // جلب لون الإيمبد من قاعدة البيانات
    const colors = await Data.get(`bankcolor-${message.guild.id}`) || "#01b8ff"; // لون افتراضي

    try {
      const rawData = fs.readFileSync('database.json');
      const database = JSON.parse(rawData);

      // الحصول على مفاتيح الأشخاص والمبالغ المالية
      const topRich = Object.entries(database)
        .filter(([key, value]) => key.startsWith("money_"))
        .map(([key, value]) => ({ id: key.replace("money_", ""), money: value }))
        .sort((a, b) => b.money - a.money)
        .slice(0, 10);

      if (topRich.length === 0) {
        return message.reply("لا يوجد أي شخص غني في السيرفر حاليًا.");
      }

      const embed = new MessageEmbed()
        .setColor(colors) // استخدام اللون المستدعى من قاعدة البيانات
        .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
        .setThumbnail('https://d.top4top.io/p_3199fpw3v1.png');

      let description = '';
      topRich.forEach((person, index) => {
        if (person.id && person.money) {
          description += `**\`#${index + 1}\` <@${person.id}> 💵 ${person.money.toLocaleString('en-US')}$**\n`;
        }
      });
      embed.setDescription(description);

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply("حدث خطأ أثناء محاولة جلب البيانات.");
    }
  },
};
