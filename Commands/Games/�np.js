const { MessageEmbed } = require("discord.js");
const Data = require('pro.db');
const products = require('./products'); // استيراد المنتجات من الملف المركزي

module.exports = {
  name: "بيع",
  description: "بيع منتج من الممتلكات",
  run: async (client, message, args) => {
    // استدعاء معرف القناة من قاعدة البيانات
    const setchannelId = await Data.get(`chatbank_${message.guild.id}`);
    
    // تحقق مما إذا كانت الرسالة في القناة الصحيحة
    if (message.channel.id !== setchannelId) {
      return message.reply("لا يمكنك بيع المنتجات في هذا الشات.");
    }

    if (args.length < 2) {
      return message.reply("يرجى كتابة اسم المنتج وعدد الوحدات التي ترغب في بيعها.");
    }

    const productName = args[0];
    const quantityToSell = parseInt(args[1]);

    if (isNaN(quantityToSell) || quantityToSell <= 0) {
      return message.reply("يرجى إدخال عدد صحيح للكمية.");
    }

    const product = products.find(p => p.name === productName);

    if (!product) {
      return message.reply("المنتج غير موجود في الممتلكات.");
    }

    const ownedQuantity = await Data.get(`owned_${message.author.id}_${product.name}`) || 0;

    if (ownedQuantity < quantityToSell) {
      return message.reply(`ليس لديك ما يكفي من **${product.name}** لبيع ${quantityToSell} وحدة.`);
    }

    // حساب السعر الأصلي للمنتجات التي يريد بيعها
    const originalPrice = product.price * quantityToSell;

    // حساب السعر العشوائي: أقل، نفس السعر أو أكثر
    const randomFactor = Math.random();
    let salePrice;
    let messageText;
    let isWin;

    if (randomFactor < 0.33) {
      salePrice = Math.floor(originalPrice * (0.5 + Math.random() * 0.3)); // بين 50% و80% من السعر الأصلي
      messageText = "معوض خير";
      isWin = false;
    } else if (randomFactor < 0.66) {
      salePrice = originalPrice;
      messageText = "تم البيع بالسعر الأصلي.";
      isWin = null;
    } else {
      salePrice = Math.floor(originalPrice * (1.1 + Math.random() * 0.4)); // بين 110% و150% من السعر الأصلي
      messageText = "تفهم في التجارة!";
      isWin = true;
    }

    // خصم الكمية المباعة من ممتلكات المستخدم
    await Data.set(`owned_${message.author.id}_${product.name}`, ownedQuantity - quantityToSell);

    // إضافة مبلغ البيع إلى رصيد المستخدم
    await Data.add(`money_${message.author.id}`, salePrice);

    // تحديث إحصائيات البيع
    const soldQuantity = await Data.get(`sold_${message.author.id}_${product.name}`) || 0;
    await Data.set(`sold_${message.author.id}_${product.name}`, soldQuantity + quantityToSell);

    if (isWin === true) {
      const salesWins = await Data.get(`wins_${message.author.id}_${product.name}`) || 0;
      await Data.set(`wins_${message.author.id}_${product.name}`, salesWins + 1);
    } else if (isWin === false) {
      const salesLosses = await Data.get(`losses_${message.author.id}_${product.name}`) || 0;
      await Data.set(`losses_${message.author.id}_${product.name}`, salesLosses + 1);
    }

    // جلب لون الإيمبد من قاعدة البيانات
    const embedColor = await Data.get(`bankcolor-${message.guild.id}`) || "#01b8ff"; // لون افتراضي إذا لم يوجد

    // إنشاء رسالة Embed لعرض تفاصيل البيع
    const embed = new MessageEmbed()
      .setTitle("💸 تمت عملية البيع")
      .setDescription(`\`تم بيع ${quantityToSell} من ${product.name}.\``)
      .addField("السعر الأصلي:", `\`${originalPrice}$\``, true)
      .addField("السعر الذي بعت به:", `\`${salePrice}$\``, true)
      .setColor(embedColor) // استخدام اللون المستدعى من قاعدة البيانات
      .setFooter({ text: messageText, iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' })
      .setThumbnail('https://k.top4top.io/p_31874hfv11.png');

    // إرسال الرسالة إلى القناة الصحيحة
    await message.channel.send({ embeds: [embed] });
  }
};
