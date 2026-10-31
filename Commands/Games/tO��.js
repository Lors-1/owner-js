const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require("discord.js");
const Data = require('pro.db');

registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "قمار",
  description: "للمشاركة في لعبة القمار",
  run: async (client, message, args) => {
    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastClaimTime = await Data.get(`gambletime_${message.author.id}`) || 0;
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
    
    let amount = 0;
    const userBalance = await Data.get(`money_${message.author.id}`) || 0;

    if (!args[0]) {
      return message.reply("اقل مبلغ للعب هو **1000$**");
    }

    if (args[0]) {
        if (args[0].toLowerCase() === "نصف" || args[0].toLowerCase() === "نص") {
            amount = Math.floor(userBalance / 2);
        } else if (args[0].toLowerCase() === "ربع") {
            amount = Math.floor(userBalance / 4);
        } else if (args[0].toLowerCase() === "كامل" || args[0].toLowerCase() === "كل") {
            amount = userBalance;
        } else {
            amount = parseInt(args[0]);
        }
    
        if (isNaN(amount) || amount < 1000) { 
            return message.reply("اقل مبلغ للعب هو **1000$**");
        }
    
        if (userBalance < amount) {
            return message.reply("هديها ما معك هالمبلغ");
        }
    }

    const fruits = [
      await loadImage('./Settings/Images/cherry.png'),
      await loadImage('./Settings/Images/grapes.png'),
      await loadImage('./Settings/Images/apple.png'),
      await loadImage('./Settings/Images/orange.png'),
      await loadImage('./Settings/Images/tomato.png'),
      await loadImage('./Settings/Images/lemon.png'),
      await loadImage('./Settings/Images/diamond.png')
    ];

    const result1 = fruits[Math.floor(Math.random() * fruits.length)];
    const result2 = fruits[Math.floor(Math.random() * fruits.length)];
    const result3 = fruits[Math.floor(Math.random() * fruits.length)];

    let winnings = 0;
    let condition = "خاسر";

    const matchedFruits = new Set([result1, result2, result3]);
    if (matchedFruits.size <= 2) {
      winnings = amount * 1.5; 
      condition = "فائز";
    }

    const finalBalance = userBalance - amount + winnings;
    await Data.set(`money_${message.author.id}`, finalBalance);
    await Data.set(`gambletime_${message.author.id}`, currentTime);
    const overlayColor = await Data.get(`bankcolor-${message.guild.id}`);
    const strokeStyle = await Data.get(`bankcolor-${message.guild.id}`) || '#01b8ff';

    const canvas = createCanvas(1220, 512);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./Settings/Images/komar1.png');
    const banner = await loadImage('./Settings/Images/banner.png');
    ctx.globalAlpha = 1;
    ctx.drawImage(background, 0, 0, 1220, 512);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over'; 

    ctx.font = '40px Cairo';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(banner, 0, 0, 1220, 512);
    ctx.globalCompositeOperation = 'source-over';

    ctx.globalAlpha = 1;
    ctx.drawImage(result1, 100, 170, 150, 150);
    ctx.drawImage(result2, 250, 170, 150, 150);
    ctx.drawImage(result3, 420, 170, 150, 150);

    ctx.font = '45px Cairo';
    ctx.fillText(condition === "فائز" ? "🏆 قمار رابح" : " قمار خاسر", 590, 110);

    const avatar = await loadImage(message.author.displayAvatarURL({ format: 'jpg', size: 128 }));
    const avatarSize = 280;
    const avatarX = 750;
    const avatarY = 100;
    const avatarRadius = avatarSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
    ctx.strokeStyle = strokeStyle; // استخدام لون الحدود المستمد من قاعدة البيانات
    ctx.lineWidth = 17;
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.font = '35px Cairo';
    ctx.fillText(`${message.guild.name} Bank`, 260, 440);

    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'fruit_gamble.png');

    const updatedBalance = await Data.get(`money_${message.author.id}`) || 0;
    const content = condition === "فائز" 
      ? `**↗️ ${winnings.toLocaleString('en-US')}$\n💵 ${updatedBalance.toLocaleString('en-US')}$**` 
      : `**↙️ ${amount.toLocaleString('en-US')}$\n💵 ${updatedBalance.toLocaleString('en-US')}$**`;

    message.reply({ content, files: [attachment] });
  },
};
