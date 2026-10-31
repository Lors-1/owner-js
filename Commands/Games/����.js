const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require("discord.js");
const Data = require('pro.db');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "سداد",
  description: "لتسديد القرض الذي تم اخذه",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const loanAmount = await Data.get(`loan_${message.author.id}`);

    if (!loanAmount) {
      return message.reply(" ما عليك قرض عشان تسده وخر");
    }

    const userBalance = await Data.get(`money_${message.author.id}`) || 0;

    if (userBalance < loanAmount) {
      return message.reply("عذرًا، رصيدك الحالي غير كافي لتسديد القرض.");
    }

    const finalBalance = userBalance - loanAmount;
    await Data.set(`money_${message.author.id}`, finalBalance);
    await Data.delete(`loan_${message.author.id}`);

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
    ctx.fillText(finalBalance.toLocaleString('en-US'), 138, 361);
    ctx.fillText(`${message.guild.name} Pay`, 150, 110);
    ctx.fillText(message.member.displayName, 140, 440);
    ctx.fillStyle = "#aba8a8";
    ctx.fillText("الآن", 1060, 110);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("سداد قرض ناجح !", 800, 230);
    ctx.font = "55px Cairo";
    ctx.font = "50px Cairo";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.font = "35px Cairo";
    ctx.fillText("شكرًا لكـ تم سداد القرض الخاص بك وخصم المبلغ المذكور من حسابكـ", 1150, 300);

    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');

    message.reply({ files: [attachment], content: `**💸 ${loanAmount.toLocaleString('en-US')}$\n💵 ${finalBalance.toLocaleString('en-US')}$**` });

  },
};
