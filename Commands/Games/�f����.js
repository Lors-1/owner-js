const fs = require('fs');
const Data = require('pro.db');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "زواجات",
  aliases: ["زوجات"],
  description: "عرض قائمة بكل الزوجات والأزواج مع المهور المدفوعة",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    // جلب لون الإيمبد من قاعدة البيانات
    const colors = await Data.get(`bankcolor-${message.guild.id}`) || "#01b8ff"; // لون افتراضي

    try {
      const rawData = fs.readFileSync('database.json');
      const parsedData = JSON.parse(rawData);
      const displayedPairs = new Set();

      const marriageEntries = Object.entries(parsedData)
        .filter(([key, value]) => key.startsWith('marriage_') && typeof value === 'object');

      if (marriageEntries.length === 0) {
        return message.reply("سيرفر عزابيه محد متزوج");
      }

      marriageEntries.sort(([, a], [, b]) => b.dowry - a.dowry);
      const topCount = Math.min(10, marriageEntries.length);

      let description = "**قائمة اغلى الزواجات بالسيرفر :**\n";
      let displayedCount = 0;

      marriageEntries.forEach(([key, marriage]) => {
        const husband = client.users.cache.get(marriage.husband);
        const spouse = client.users.cache.get(marriage.spouse);

        if (husband && spouse && displayedCount < topCount) {
          if (!displayedPairs.has(marriage.husband) && !displayedPairs.has(marriage.spouse)) {
            displayedCount++;
            description += `**#${displayedCount} ${husband} 💍 ${spouse} : ${marriage.dowry.toLocaleString('en-US')}$ 💵**\n`;
            displayedPairs.add(marriage.husband);
            displayedPairs.add(marriage.spouse);
          }
        }
      });

      const embed = new MessageEmbed()
        .setColor(colors) // استخدام اللون المستدعى من قاعدة البيانات
        .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
        .setDescription(description)
        .setThumbnail('https://g.top4top.io/p_3185zvf9b1.png');

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply("حدث خطأ أثناء محاولة جلب البيانات.");
    }
  },
};
