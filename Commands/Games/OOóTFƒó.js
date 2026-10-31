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
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

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
