const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment, MessageEmbed } = require("discord.js");
const Data = require('pro.db');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "نهب",
  aliases: ["سرقه", "زرف"], // إضافة الاختصار
  description: "نهب شخص",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastClaimTime = await Data.get(`Lootingtime_${message.author.id}`) || 0;
    const currentTime = Date.now();
    const timeDifference = currentTime - lastClaimTime;

    if (timeDifference < 240000) {
      const remainingTime = 240000 - timeDifference;
      const minutes = Math.floor(remainingTime / (1000 * 60));
      const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
      return message.reply(`⌛ خف شوي  \`${minutes} دقائق ${seconds} ثانية\``);
    }
    const isBlocked = await Data.get(`blocked_${message.author.id}`);
    if (isBlocked) return message.react("🔒");

    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply("منشن الي بتزرفه .");

    if (targetUser.id === message.author.id) return message.reply("وش وصلك للمرحله ذي؟");

    const activeProtection = await Data.get(`protectionHours_${targetUser.id}`);
    let timeMessage = "";
    
    if (activeProtection) {
      const { hours, startTime } = activeProtection;
      const remainingTime = hours * 3600000 - (Date.now() - startTime);
    
      if (remainingTime > 0) {
        // إذا كان الوقت المتبقي للحماية أكبر من صفر
        const remainingHours = Math.floor(remainingTime / 3600000);
        const remainingMinutes = Math.floor((remainingTime % 3600000) / 60000);
        const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
    
        let timeMessage = "⌛ الحماية تنتهي بعد \`";
        if (remainingHours > 0) {
          timeMessage += `${remainingHours} ساعة و `;
        }
        if (remainingMinutes > 0 || remainingHours <= 0) {
          timeMessage += `${remainingMinutes} دقيقة و `;
        }
        timeMessage += `${remainingSeconds} ثانية.\``;
    
        return message.reply(`${timeMessage}`);
      } else {
        // إذا انتهى الوقت، يتم حذف الحماية من قاعدة البيانات
        await Data.delete(`protectionHours_${targetUser.id}`);
      }
    }
    
    
    const userBalance = await Data.get(`money_${message.author.id}`) || 0;
    const lootPercentage = Math.floor(Math.random() * (15 - 1 + 1)) + 1; // نسبة النهب بين 1% و 15%
    const targetBalance = await Data.get(`money_${targetUser.id}`) || 0;

    if (targetUser.bot) {
      return message.reply("اقول وخر عن البوتات 😡");
    }


    if (targetBalance < 5000) return message.reply("طفران لازم يكون معه **5000$** عشان تزرفه .");


    const lootedAmount = Math.min(targetBalance, Math.floor((targetBalance * lootPercentage) / 100));
    const newTargetBalance = targetBalance - lootedAmount;
    const newBalance = userBalance + lootedAmount;

    await Data.set(`money_${targetUser.id}`, newTargetBalance);
    await Data.set(`money_${message.author.id}`, newBalance);

    await Data.add(`totalLoot_${message.author.id}`, lootedAmount); // حفظ المبلغ الذي تم سرقته
    await Data.set(`Lootingtime_${message.author.id}`, currentTime);

    const canvas = createCanvas(1220, 512);
    const ctx = canvas.getContext('2d');

    const avatarURL = message.author.displayAvatarURL({ format: 'png', dynamic: false, size: 256 });
    const avatar = await loadImage(avatarURL);

    const moneyImage = await loadImage('./Settings/Images/money.png');
    const background = await loadImage('./Settings/Images/wage.png');
    const overlayColor = Data.get(`bankcolor-${message.guild.id}`)
    ctx.drawImage(background, 0, 0, 1220, 512);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor; // استخدام اللون المعرف
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(moneyImage, 0, 0, 1220, 512);


    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "45px Cairo";
    ctx.fillText(newBalance.toLocaleString('en-US'), 138, 361);
    ctx.fillText(`${message.guild.name} Pay`, 150, 110);
    ctx.fillText(message.member.displayName, 140, 440);
    ctx.fillStyle = "#aba8a8";
    ctx.fillText("الآن", 1060, 110);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("تمت السرقة بنجاح !!", 750, 230);
    ctx.font = "55px Cairo";
    ctx.font = "50px Cairo";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.font = "40px Cairo";
    ctx.fillText("تم إيداع المبلغ بحسابك انتبه لا يصيدك", 1150, 290);
    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');

    message.reply({ files: [attachment], content: `<@${message.author.id}> 🏃🏻‍♂️ <@${targetUser.id}>\n**➡️ ${lootPercentage}%\n💵 ${newBalance.toLocaleString('en-US')}$**` });
    // إرسال رسالة في الخاص للشخص الذي قام بكتابة الأمر
    const looterEmbed = new MessageEmbed()
      .setColor('#01b8ff')
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setDescription(`**كفو عليك يالحرامي 😉\nعملية نهب ${targetUser} قد تمت بنجاح\nالمبلغ: ${lootedAmount}$\nبس هااه انتبه احد يدري او تعلم احد\nانا عن نفسي ما بعلم 🤭**`)
      .setThumbnail('https://a.top4top.io/p_3185s6fd11.png')
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });
    message.author.send({ embeds: [looterEmbed] }).catch(console.error);

    // إرسال رسالة في الخاص للشخص الذي تم نهبه
    const replyLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
    const targetEmbed = new MessageEmbed()
      .setColor('#01b8ff')
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setDescription(`**الحق الحق حلالك !\n ذا <@${message.author.id}> سرق منك **${lootedAmount}$**\nلا تقول اني علمتك 😉\n\n[لعرض دليل](${replyLink})**`)
      .setThumbnail('https://h.top4top.io/p_3185odnlz1.png')
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });
    targetUser.send({ embeds: [targetEmbed] }).catch(console.error);

  },
};
