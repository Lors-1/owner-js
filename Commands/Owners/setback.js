const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require('discord.js');
const Data = require('pro.db'); // تأكد من وجود مكتبة pro.db وتكوينها بشكل صحيح
const fs = require('fs'); // استيراد مكتبة fs
const path = require('path'); // استيراد مكتبة path لمعالجة المسارات
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
  name: "setback",
  aliases: ["اضافه-خلفيه"],
  description: "لاضافه خلفيه للبنك",
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return message.react('');
    if (!message.attachments.size) {
      return message.channel.send("الرجاء رفع صورة كخلفية.");
    }

    // استلام الصورة من الرسالة
    const attachment = message.attachments.first();
    const imageUrl = attachment.url;

    // تحميل الصورة
    try {
      const image = await loadImage(imageUrl);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // تحويل الصورة إلى Buffer
      const buffer = canvas.toBuffer();

      // تحديد مسار حفظ الصورة
      const imagesDir = path.join(__dirname, '..','..', 'Settings', 'Images');
      const imagePath = path.join(imagesDir, 'banner.png');

      // التحقق من وجود المجلد، وإنشاءه إذا لم يكن موجوداً
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // حفظ الصورة إلى المسار المحدد
      fs.writeFileSync(imagePath, buffer);

      // تخزين مسار الصورة أو بياناتها في قاعدة البيانات
      await Data.set('Bank.background', imagePath);

      // إرسال تأكيد للمستخدم
      message.channel.send("تم تعيين الخلفية بنجاح!");

    } catch (error) {
      console.error("فشل تحميل الصورة:", error);
      message.channel.send("فشل تحميل الصورة. يرجى المحاولة مرة أخرى.");
    }
  },
};
