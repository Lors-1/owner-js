const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment, Channel } = require("discord.js");
const Data = require('pro.db');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "حظ",
  aliases: ["حظي","حظوظ"], // إضافة الاختصار
  description: "جرب حظك",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastClaimTime = await Data.get(`lucktime_${message.author.id}`) || 0;
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

    const previousBalance = await Data.get(`money_${message.author.id}`) || 0;
    const addedAmount = Math.floor(Math.random() * (3000 - 50 + 1)) + 50; // تحديد النسبة بين 50 و 3000
    const newBalance = previousBalance + addedAmount;
    await Data.set(`money_${message.author.id}`, newBalance);
    await Data.set(`lucktime_${message.author.id}`, currentTime);

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
    ctx.fillText("عملية إيداع", 930, 230);
   // ctx.drawImage(avatar, 58, 58, 70, 70);
    ctx.font = "55px Cairo"; 
    ctx.font = "50px Cairo"; 
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right"; 
    ctx.font = "40px Cairo"; 
    ctx.fillText("حظك فالوقت الحالي", 1150, 290); 
    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');
    message.reply({ files: [attachment], content: `**➡️ ${addedAmount.toLocaleString('en-US')}$\n💵 ${newBalance.toLocaleString('en-US')}$**` });
  },
};
