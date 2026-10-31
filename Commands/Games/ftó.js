const { MessageEmbed } = require("discord.js");
const Data = require('pro.db');

module.exports = {
  name: "وقت",
  description: "لعرض الوقت المتبقي لكل الأنشطة",
  run: async (client, message, args) => {
    let setchannel = await Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const user = message.author;
    const guild = message.guild;

    // استدعاء اللون من قاعدة البيانات
    const colors = await Data.get(`bankcolor-${message.guild.id}`) || '#01b8ff';

    // وقت الحماية
    const activeProtection = await Data.get(`protectionHours_${message.author.id}`);
    let protectionRemainingTime = "";
    if (activeProtection) {
      const { hours, startTime } = activeProtection;
      const remainingTime = hours * 3600000 - (Date.now() - startTime);

      if (remainingTime > 0) {
        const remainingHours = Math.floor(remainingTime / 3600000);
        const remainingMinutes = Math.floor((remainingTime % 3600000) / 60000);
        protectionRemainingTime = `: \`${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}\` `;
      } else {
        await Data.delete(`protectionHours_${message.author.id}`);
        protectionRemainingTime = "جاهز للعب ";
      }
    } else {
      protectionRemainingTime = "جاهز للعب ";
    }

    // الأنشطة الأخرى
    const activities = [
      "investtime",
      "bakchichtime",
      "Tradetime",
      "lucktime",
      "moneytime",
      "bettime",
      "Dicegtime",
      "gametime",
      "gambletime",
      "Lootingtime",
      "fruitstime", // وقت لعبة الفواكه
    ];

    const remainingTimes = {};
    const cooldownTime = 300000; // وقت الانتظار الافتراضي (5 دقائق)

    for (const activity of activities) {
      const lastClaimTime = await Data.get(`${activity}_${user.id}`) || 0;
      const currentTime = Date.now();
      const timeDifference = currentTime - lastClaimTime;
      let remainingTime;

      if (timeDifference >= cooldownTime) {
        remainingTime = "جاهز للعب ";
      } else {
        remainingTime = cooldownTime - timeDifference; 
        const minutes = Math.floor(remainingTime / (1000 * 60));
        const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
        remainingTime = `: \`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}\` `;
      }

      remainingTimes[activity] = remainingTime;
    }

    // إنشاء Embed لعرض الأوقات المتبقية
    const embed = new MessageEmbed()
      .setAuthor(guild.name, guild.iconURL({ dynamic: true, size: 1024, format: 'png' }))
      .setColor(colors)
      .setDescription(`**فواكه: ${remainingTimes.fruitstime}\nلعبه: ${remainingTimes.gametime}\nاستثمار: ${remainingTimes.investtime}\nبخشيش: ${remainingTimes.bakchichtime}\nتداول: ${remainingTimes.Tradetime}\nحظ: ${remainingTimes.lucktime}\nراتب: ${remainingTimes.moneytime}\nرهان: ${remainingTimes.bettime}\nنرد: ${remainingTimes.Dicegtime}\nنهب: ${remainingTimes.Lootingtime}\nحماية: ${protectionRemainingTime}\nقمار: ${remainingTimes.gambletime}**`);

    await message.reply({ embeds: [embed] });
  },
};
