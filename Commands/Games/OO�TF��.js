const { MessageEmbed } = require("discord.js");
const Data = require('pro.db');

const products = [
  { name: 'جوال', price: 11999 },
  { name: 'اجهزه', price: 111999 },
  { name: 'سياره', price: 233549 },
  { name: 'بيت', price: 322799 },
  { name: 'قصر', price: 7109999 },
  { name: 'شركه', price: 10998989 },
  { name: 'ارض', price: 755689770 },
  { name: 'اسهم', price: 109099 },
  { name: 'ذهب', price: 19099 },
  { name: 'فضه', price: 1099 },
  { name: 'الماس', price: 19555090 },
  { name: 'كوكب', price: 3888888099 },
];

module.exports = {
  name: "ممتلكات",
  description: "عرض ممتلكات المستخدم",
  run: async (client, message, args) => {
    const userId = message.author.id;

    // استدعاء إعداد القناة
    const setchannel = await Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    // استدعاء اللون من قاعدة البيانات
    const embedColor = await Data.get(`bankcolor_${message.guild.id}`) || "#01b8ff"; // لون افتراضي إذا لم يوجد في الداتا

    // إنشاء رسالة إيمبد
    const embed = new MessageEmbed()
      .setTitle(`🏠 ممتلكات ${message.member.displayName}`)
      .setColor(embedColor) // استخدام اللون المستدعى
      .setThumbnail('https://a.top4top.io/p_3187ecdcd1.png')
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });

    let hasItems = false;

    // المرور على جميع المنتجات لعرض الكمية التي يمتلكها المستخدم أو 0 إذا لم يشتري
    for (let product of products) {
      const quantity = await Data.get(`owned_${userId}_${product.name}`) || 0;
      embed.addField(`**${product.name}**`, `\`الكمية: ${quantity}\``, true);
      if (quantity > 0) {
        hasItems = true;
      }
    }

    if (!hasItems) {
      embed.setDescription("ليس لديك أي ممتلكات بعد.");
    }

    await message.reply({ embeds: [embed] });
  }
};
