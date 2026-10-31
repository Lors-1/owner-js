const { MessageEmbed } = require("discord.js");
const products = require('./products');
const { get } = require('pro.db');

let lastUpdatedTime = Date.now();
const updateInterval = 3600000; // 60 دقيقة (3600000 ميلي ثانية)
let setchannel; // متغير لتخزين معرف القناة

const updatePrices = async (channel) => {
  products.forEach(product => {
    const changeFactor = Math.random() < 0.5 ? 0.99 : 1.20;
    product.price = Math.floor(product.price * changeFactor);
  });
  lastUpdatedTime = Date.now(); // تأكد من تحديث الوقت هنا

  const updateEmbed = new MessageEmbed()
    .setTitle("تحديث أسعار المتجر")
    .setDescription("لقد تم تحديث أسعار المنتجات بنجاح")
    .setColor("#ffffff")
    .setThumbnail('https://a.top4top.io/p_3199t68zr1.png')
    .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });

  await channel.send({ embeds: [updateEmbed] });
};

const startPriceUpdater = async (client) => {
  setchannel = await get(`chatbank_${client.guild.id}`);

  setInterval(async () => {
    const channel = client.channels.cache.get(setchannel);
    if (channel) {
      await updatePrices(channel);
    }
  }, updateInterval);
};

module.exports = {
  name: "متجر",
  description: "عرض المنتجات المتاحة مع الوقت المتبقي لتحديث الأسعار",
  run: async (client, message, args) => {
    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - lastUpdatedTime;
    let remainingTime = updateInterval - timeSinceLastUpdate;

    // استدعاء معرف القناة من قاعدة البيانات
    setchannel = await get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    // إذا انتهى الوقت (مرّ أكثر من 60 دقيقة منذ آخر تحديث)، قم بتحديث الأسعار
    if (remainingTime <= 0) {
      const channel = client.channels.cache.get(setchannel);
      if (channel) {
        await updatePrices(channel);
      }
      remainingTime = updateInterval; // إعادة ضبط الوقت المتبقي بعد التحديث
    }

    // حساب الدقائق والثواني المتبقية
    const minutes = Math.max(Math.floor(remainingTime / (1000 * 60)), 0); // تأكد من عدم وجود قيمة سالبة
    const seconds = Math.max(Math.floor((remainingTime % (1000 * 60)) / 1000), 0);

    const embedColor = await get(`bankcolor-${message.guild.id}`) || "#01b8ff";
    const embed = new MessageEmbed()
      .setTitle("🛒 المتجر")
      .setColor(embedColor)
      .setThumbnail('https://l.top4top.io/p_3187v749q1.png')
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' })
      .addField("⏳ **الوقت المتبقي لتحديث المتجر:**", `\`${minutes} دقيقة و ${seconds} ثانية\``, false);

    products.forEach(product => {
      embed.addField(` ${product.name}`, `\`${product.price}$\``, true);
    });

    await message.reply({ embeds: [embed] });
  },
  startPriceUpdater
};
