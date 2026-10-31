const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require("discord.js");
const Data = require('pro.db');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "تحويل",
  aliases: ["تحويل", "نقل"],
  description: "تحويل رصيد من شخص إلى آخر",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const sender = message.author;
    const receiver = message.mentions.users.first();
    
    const isEnabled = await Data.get(`transformation_${message.guild.id}`);
    if (!isEnabled) return message.reply("**نظام التحويلات مغلق من قبل مدير البنك حاليًا **");

    const isBlocked = await Data.get(`blocked_${message.author.id}`);
    if (isBlocked) return message.react("🔒");
    
    if (!receiver) return message.reply(`> يرجى إستعمال الامر بالطريقة الصحيحة\nتحويل <@${message.author.id}> 7000`);

    if (receiver.id === sender.id) return message.reply("يعني بتزيد فلوسك كذا ؟");

    let amount = 0;
    const amountArg = args[1].toLowerCase(); 
    if (amountArg === "كامل" || amountArg === "كل") {
        amount = await Data.get(`money_${sender.id}`) || 0; 
      } else if (amountArg === "نصف" || amountArg === "نص") {
        amount = Math.floor((await Data.get(`money_${sender.id}`)) / 2);
      } else if (amountArg === "ربع") {
        amount = Math.floor((await Data.get(`money_${sender.id}`)) / 4); 
      } else {
        amount = parseInt(args[1]); 
      }
      

    if (!amount || isNaN(amount) || amount <= 0) return message.reply(`> يرجى إستعمال الامر بالطريقة الصحيحة\nتحويل <@${message.author.id}> 7000`);

    const senderBalance = await Data.get(`money_${sender.id}`) || 0;
    if (senderBalance < amount) return message.reply("بس يا الغني انت ما معك المبلغ");

    const deduction = Math.ceil(amount * 0.1);
    const transferredAmount = amount - deduction;

    await Data.subtract(`money_${sender.id}`, amount);
    await Data.add(`money_${receiver.id}`, transferredAmount);

    const newSenderBalance = await Data.get(`money_${sender.id}`) || 0;
    const receiverBalance = await Data.get(`money_${receiver.id}`) || 0;

    const canvas = createCanvas(1220, 512);
    const ctx = canvas.getContext('2d');

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
    ctx.fillText(receiverBalance.toLocaleString('en-US'), 138, 361); 
    ctx.fillText(`${sender.username} Transfer`, 150, 110); 
    ctx.fillText(receiver.username, 140, 440); 
    ctx.fillStyle = "#aba8a8";
    ctx.fillText("الآن", 1060, 110); 
    ctx.fillStyle = "#ffffff";
    ctx.fillText("عملية التحويل", 880, 230);
    ctx.font = "55px Cairo"; 
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right"; 
    ctx.font = "40px Cairo"; 
    ctx.fillText("تم تحويل المبلغ المذكور وخصمه من حسابكـ", 1150, 290); 
    

    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');

    message.reply({ files: [attachment], content: `**${sender} ➡️ ${receiver}\nتم خصم عمولة تحويل 10%\n💸 ${amount.toLocaleString('en-US')}\n💵 ${newSenderBalance.toLocaleString('en-US')}**` });
  },
};
