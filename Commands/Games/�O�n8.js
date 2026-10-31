const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require("discord.js");
const Data = require('pro.db'); // Move this require inside the function to avoid circular dependencies
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "حمايه",
  aliases: ["حماية"],
  description: "تعيين عدد ساعات الحماية وخصم المبلغ المناسب",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const isBlocked = await Data.get(`blocked_${message.author.id}`);
    if (isBlocked) return message.react("🔒");

    const canvas = createCanvas(1220, 512); // Create a canvas
    const ctx = canvas.getContext('2d'); // Get the canvas context

    const activeProtection = await Data.get(`protectionHours_${message.author.id}`);

    if (activeProtection) {
      const { hours, startTime } = activeProtection;
      let remainingTime = hours * 3600000 - (Date.now() - startTime);

      if (remainingTime <= 0) {
        await Data.delete(`protectionHours_${message.author.id}`);
        return message.reply("كان عندك حماية وخلصت");
      }

      const remainingHours = Math.floor(remainingTime / 3600000);
      const remainingMinutes = Math.floor((remainingTime % 3600000) / 60000);
      const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);

      let remainingTimeText = "";
      if (remainingHours > 0) {
        remainingTimeText += `${remainingHours} ساعة `;
      }
      if (remainingMinutes > 0) {
        remainingTimeText += `${remainingMinutes} دقيقة `;
      }
      if (remainingSeconds > 0) {
        remainingTimeText += `${remainingSeconds} ثانية`;
      }

      
      return message.reply(`الحماية تنتهي بعد ⌛ \`${remainingTimeText}\``);
    }

    const hours = parseInt(args[0]);

    if (isNaN(hours) || hours <= 0) {
      return message.reply("حط عدد ساعات صحيح يالطيب");
    }

    const cost = hours * 100000;

    const maxProtectionHours = 5;

    if (hours > maxProtectionHours) {
      return message.reply(`اقصى حد للحماية خمس ساعات.`);
    }
    

    const userBalance = await Data.get(`money_${message.author.id}`) || 0;

    if (userBalance < cost) {
        const remainingBalanceNeeded = cost - userBalance;
        return message.reply(`لازم يكون معك **${remainingBalanceNeeded.toLocaleString('en-US')}$.**`);

      }
      
    const money = userBalance - cost; // Calculate the remaining balance after deducting the cost
    const newBalance = userBalance - cost;
    await Data.set(`money_${message.author.id}`, newBalance);

    await Data.set(`protectionHours_${message.author.id}`, { hours, startTime: Date.now() });

    setTimeout(async () => {
      await Data.delete(`protectionHours_${message.author.id}`);
      message.author.send("لقد انتهت فترة الحماية.");
    }, hours * 3600000);

    const moneyImage = await loadImage('./Settings/Images/money.png');
    const background = await loadImage('./Settings/Images/wage.png');
    const overlayColor = Data.get(`bankcolor-${message.guild.id}`);

    ctx.drawImage(background, 0, 0, 1220, 512); 
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor; // استخدام اللون المعرف
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over'; 
    ctx.drawImage(moneyImage, 0, 0, 1220, 512); 



    ctx.fillStyle = "#ffffff";
    ctx.font = "45px Cairo";
    ctx.fillText(money.toLocaleString('en-US'), 138, 361);
    ctx.fillText(`${message.guild.name} Pay`, 150, 110);
    ctx.fillText(message.member.displayName, 140, 440);
    ctx.fillStyle = "#aba8a8";
    ctx.fillText("الآن", 1060, 110);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`تم سحب ${cost.toLocaleString('en-US')} من حسابك لضمان مدة حمايتك`, 135, 230);
    ctx.font = "55px Cairo";
    ctx.font = "50px Cairo";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.font = "40px Cairo";
    ctx.fillText(`مُدة حمياتك هيا  ${hours} ساعة`, 1150, 300);



    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');
    message.reply({ files: [attachment], content: `**🕔 ${hours}\n💸 ${cost.toLocaleString('en-US')}$\n💵 ${money.toLocaleString('en-US')}$**` });

  },
};