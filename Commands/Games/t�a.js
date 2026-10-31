const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require("discord.js");
const Data = require('pro.db');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "قرض",
  aliases: ["قرضي"],
  description: "للحصول على راتب",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;


    const previousLoan = await Data.get(`loan_${message.author.id}`);
    
    if (previousLoan) {
      return message.reply("⏳ سد القرض الي عليك بالاول");
    }

    const loanAmount = 100000;
    const previousBalance = await Data.get(`money_${message.author.id}`) || 0;
    const newBalance = previousBalance + loanAmount;

    await Data.set(`money_${message.author.id}`, newBalance);
    await Data.set(`loan_${message.author.id}`, loanAmount);

    const currentTime = Date.now();
    await Data.set(`loanTime_${message.author.id}`, currentTime);

    const canvas = createCanvas(1220, 512);
    const ctx = canvas.getContext('2d');

    const moneyImage = await loadImage('./Settings/Images/money.png');
    const background = await loadImage('./Settings/Images/wage.png');
    const overlayColor = Data.get(`bankcolor-${message.guild.id}`);

    ctx.drawImage(background, 0, 0, 1220, 512);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(moneyImage, 0, 0, 1220, 512);

    ctx.fillStyle = "#ffffff";
    ctx.font = "45px Cairo";
    ctx.fillText(newBalance.toLocaleString('en-US'), 138, 361);
    ctx.fillText(`${message.guild.name} Pay`, 150, 110);
    ctx.fillText(message.member.displayName, 140, 440);
    ctx.fillStyle = "#aba8a8";
    ctx.fillText("الآن", 1060, 110);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("عملية إيداع", 930, 230);
    ctx.font = "55px Cairo";
    ctx.font = "50px Cairo";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.font = "35px Cairo";
    ctx.fillText("تم إيداع مبلغ 100.100$ بحسابكـ سيتم خصم جبريًأ خلال ساعة", 1150, 300);

    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');

    message.reply({ files: [attachment], content: `**➡️ ${loanAmount.toLocaleString('en-US')}$\n💵 ${newBalance.toLocaleString('en-US')}$**` });

    // Deduct the loan amount after 1 hour if not paid
    setTimeout(async () => {
      const updatedBalance = await Data.get(`money_${message.author.id}`) || 0;
      const deductionAmount = await Data.get(`loan_${message.author.id}`) || 0;

      if (updatedBalance >= deductionAmount) {
        const finalBalance = updatedBalance - deductionAmount;
        await Data.set(`money_${message.author.id}`, finalBalance);
        await Data.delete(`loan_${message.author.id}`);
        message.author.send(`💸 تم خصم مبلغ القرض ${deductionAmount.toLocaleString('en-US')}$ من حسابك.`);
      }
    }, 3600000); // 3600000 milliseconds = 1 hour
  },
};
