const { MessageAttachment } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require('canvas');
const Data = require('pro.db');
const fs = require('fs');
const path = require('path');

registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

async function createBalanceImage(targetUser, userMoney, overlayColor, backgroundPath) {
  const canvas = createCanvas(1220, 512);
  const ctx = canvas.getContext('2d');

  const avatarURL = targetUser.user.displayAvatarURL({ format: 'png', dynamic: false, size: 256 });
  const avatar = await loadImage(avatarURL);
  const background = await loadImage(backgroundPath);
  const banner = await loadImage('./Settings/Images/banner.png');

  ctx.globalAlpha = 1;
  ctx.drawImage(background, 0, 0, 1220, 512);
  
  ctx.globalAlpha = 0.6;
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(banner, 0, 0, 1220, 512);
  ctx.globalCompositeOperation = 'source-over';

  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = overlayColor || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.font = "45px Cairo";
  ctx.fillText(userMoney.toLocaleString('en-US'), 460, 300);
  ctx.fillText(`${targetUser.guild.name} Bank`, 740, 440);
  ctx.fillText(targetUser.displayName, 380, 230);
  ctx.fillText("فلوسك", 930, 160);

  ctx.font = "50px Cairo";
  ctx.textAlign = "right";

  const avatarX = 68;
  const avatarY = 125;
  const avatarRadius = 148;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(avatar, avatarX, avatarY, avatarRadius * 2, avatarRadius * 2);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
  ctx.lineWidth = 10;
  ctx.strokeStyle = overlayColor || '#01b8ff'; // تغيير اللون هنا
  ctx.stroke();

  const buffer = canvas.toBuffer();
  return buffer;
}

module.exports = {
  name: "فلوس",
  aliases: ["فلوسي", "رصيد", "رصيدي"],
  description: "فحص الرسائل لعرض الفلوس",
  run: async (client, message, args) => {
    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    let targetUser = message.mentions.members.first() || message.member;
    const overlayColor = Data.get(`bankcolor-${message.guild.id}`);
    const rawData = fs.readFileSync('database.json');
    const database = JSON.parse(rawData);
    const userMoney = database[`money_${targetUser.id}`] || 0;

    const backgroundPath = './Settings/Images/monlo1.png';
    const imageBuffer = await createBalanceImage(targetUser, userMoney, overlayColor, backgroundPath);

    const attachment = new MessageAttachment(imageBuffer, 'balance.png');
    message.reply({ files: [attachment], content: `<@${targetUser.id}> **رصيدك الحالي في البنك**` });
  },
};
