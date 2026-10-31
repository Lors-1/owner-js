const { MessageEmbed } = require("discord.js");
const Data = require('pro.db');
const products = require('./products'); // استيراد المنتجات من الملف المركزي

module.exports = {
  name: "المبيعات",
  description: "عرض إحصائيات المبيعات للمستخدم",
  run: async (client, message, args) => {
    const userId = message.author.id;

    // استدعاء إعداد القناة
    const setchannel = await Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    // جلب لون الإيمبد من قاعدة البيانات
    const embedColor = await Data.get(`bankcolor_${message.guild.id}`) || "#01b8ff"; // لون افتراضي إذا لم يوجد

    // إنشاء رسالة إيمبد
    const embed = new MessageEmbed()
      .setTitle(`📊 إحصائيات مبيعات ${message.member.displayName}`)
      .setColor(embedColor) // استخدام اللون المستدعى من قاعدة البيانات
      .setThumbnail("https://h.top4top.io/p_3187ofl051.png")
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });

    let hasSales = false;

    // المرور على جميع المنتجات وعرض إحصائيات المبيعات لكل منتج
    for (let product of products) {
      const soldQuantity = await Data.get(`sold_${userId}_${product.name}`) || 0;
      const salesWins = await Data.get(`wins_${userId}_${product.name}`) || 0;
      const salesLosses = await Data.get(`losses_${userId}_${product.name}`) || 0;

      if (soldQuantity > 0) {
        hasSales = true;
        embed.addField(
          `${product.name}`, // عرض السعر مع رمز المنتج
          `\`تم بيع: ${soldQuantity}\` \n \`الربح  : ${salesWins} مرة\` \n\` الخساره : ${salesLosses} مرة\``,
          true
        );
      }
    }

    if (!hasSales) {
      embed.setDescription("لم تقم بأي مبيعات حتى الآن.");
    }

    await message.reply({ embeds: [embed] });
  }
};
