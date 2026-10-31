const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const Data = require('pro.db');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });
const Discord = require("discord.js");

// دالة لتغيير لون الصورة
async function changeImageColor(imagePath, color) {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // رسم الصورة على القماش
    ctx.drawImage(image, 0, 0);

    // تغيير اللون
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    return canvas.toBuffer(); // إرجاع الصورة المعدلة
}

module.exports = {
  name: "استثمار",
  description: "استثمار مبلغ معين والفوز أو الخسارة بنسبة مئوية",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastClaimTime = await Data.get(`investtime_${message.author.id}`) || 0;
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

    const originalBalance = userBalance;

    const profitPercentage = Math.floor(Math.random() * 100) + 1;
    const profitAmount = Math.floor(amount * (profitPercentage / 100));

    const isWin = Math.random() < 0.5;

    if (isWin) {
      const winProfitPercentage = 20;
      const winProfit = Math.floor(amount * (winProfitPercentage / 100));
      await Data.add(`money_${message.author.id}`, winProfit);
      
      let wins = await Data.get(`wins_${message.author.id}`) || 0;
      await Data.set(`wins_${message.author.id}`, wins + 1);
      let investmentWins = await Data.get(`investmentWins_${message.author.id}`) || 0;
      await Data.set(`investmentWins_${message.author.id}`, investmentWins + 1);

    } else {
      const lossDeductionPercentage = 10;
      const lossDeduction = Math.floor(amount * (lossDeductionPercentage / 100));
      await Data.subtract(`money_${message.author.id}`, lossDeduction);
      
      let losses = await Data.get(`losses_${message.author.id}`) || 0;
      await Data.set(`losses_${message.author.id}`, losses + 1);
    }

    await Data.set(`investtime_${message.author.id}`, currentTime);
    const overlayColor = await Data.get(`bankcolor-${message.guild.id}`);

    // استخدام الدالة لتغيير لون الصور
    const LossImageBuffer = await changeImageColor('./Settings/Images/Loss.png', overlayColor);
    const victoryImageBuffer = await changeImageColor('./Settings/Images/victory.png', overlayColor);

    const Loss = await loadImage(LossImageBuffer);
    const victory = await loadImage(victoryImageBuffer);
    const background = await loadImage('./Settings/Images/monlo.png');
    const Rapids = await loadImage('./Settings/Images/Rapids.png');
    const banner = await loadImage('./Settings/Images/banner.png');

    const canvas = createCanvas(1220, 512);
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 0.9;
    ctx.drawImage(background, 0, 0, 1220, 512);
    ctx.drawImage(Rapids, 0, 0, 1220, 512); 

    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over'; 

    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(banner, 0, 0, 1220, 512);
    ctx.globalCompositeOperation = 'source-over';

    ctx.globalAlpha = 1;
    ctx.drawImage(isWin ? victory : Loss, 0, 0, 1220, 512); 

    ctx.fillStyle = isWin ? "#00FF00" : "#FF0000";
    ctx.textAlign = "center";
    ctx.font = "bold 60px Cairo";

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "45px Cairo"; 
    ctx.fillText(`${message.guild.name} Pay`, 150, 110); 
    
    const avatarURL = message.author.displayAvatarURL({ format: 'png', dynamic: false, size: 256 });
    const avatar = await loadImage(avatarURL);
  
    ctx.fillStyle = "#aba8a8";
    ctx.fillText("الآن", 1060, 110); 
    ctx.fillStyle = "#ffffff";
    ctx.fillText(isWin ? "استثمار ناجح!" : "استثمار خاسر!", 875, 230);

    ctx.font = "50px Cairo"; 
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right"; 
    ctx.font = "40px Cairo"; 

    const winPercentage = isWin ? profitPercentage : -profitPercentage;
    const textColor = isWin ? "#8cf2b7" : "#fb88a6";

    ctx.fillStyle = textColor;
    ctx.font = "bold 35px Cairo";
    ctx.textAlign = "center";
    ctx.fillText(`${winPercentage}%`, 850, 350);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px Cairo";

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right"; 
    ctx.font = "25px Cairo"; 
    ctx.fillText(isWin ? "تم إضافة المبلغ المذكور إلي حسابك" : "تم خصم المبلغ المذكور من حسابكـ", 1150, 280); 

    const updatedBalance = await Data.get(`money_${message.author.id}`) || 0;
    const content = isWin ? `**↗️ ${profitAmount.toLocaleString('en-US')}$\n💵 ${updatedBalance.toLocaleString('en-US')}$**` : `**↙️ ${amount.toLocaleString('en-US')}$\n💵 ${updatedBalance.toLocaleString('en-US')}$**`;

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Cain.png');
    message.reply({ content: content, files: [attachment] });
  }
};
