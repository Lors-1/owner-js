const { createCanvas, registerFont, loadImage } = require('canvas');
const { MessageAttachment } = require("discord.js");
const Data = require('pro.db');

registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

const MIN_AMOUNT = 1000; // Define minimum amount as a constant
const COOLDOWN = 240000; // 4 minutes cooldown time

module.exports = {
  name: "نرد",
  description: "لعبة النرد",
  run: async (client, message, args) => {
    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastClaimTime = await Data.get(`Dicegtime_${message.author.id}`) || 0;
    const currentTime = Date.now();
    const timeDifference = currentTime - lastClaimTime;

    if (timeDifference < COOLDOWN) { 
      const remainingTime = COOLDOWN - timeDifference;
      const minutes = Math.floor(remainingTime / (1000 * 60));
      const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
      return message.reply(`⌛ تعال بعد \`${minutes} دقائق ${seconds} ثانية\``);
    }

    const isBlocked = await Data.get(`blocked_${message.author.id}`);
    if (isBlocked) return message.react("🔒");

    let amount = parseInt(args[0]) || 0;
    if (args[0]) {
      if (args[0].toLowerCase() === "نصف" || args[0].toLowerCase() === "نص") {
        amount = Math.floor(await Data.get(`money_${message.author.id}`) / 2);
      } else if (args[0].toLowerCase() === "ربع") {
        amount = Math.floor(await Data.get(`money_${message.author.id}`) / 4);
      } else if (args[0].toLowerCase() === "كامل" || args[0].toLowerCase() === "كل") {
        amount = await Data.get(`money_${message.author.id}`);
      }
    }

    if (amount < MIN_AMOUNT) {
      return message.reply(`أقل مبلغ للعب هو **${MIN_AMOUNT}$**`);
    }

    const userBalance = await Data.get(`money_${message.author.id}`) || 0;
    if (userBalance < amount) {
      return message.reply("ليس لديك المبلغ الكافي");
    }

    // Create and draw on the canvas
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const banner = await loadImage('./Settings/Images/banner.png');
    const background = await loadImage('./Settings/Images/monlo12.png');

    ctx.globalAlpha = 0.9;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const overlayColor = await Data.get(`bankcolor-${message.guild.id}`) || "#FFFFFF"; // Default color if not set

    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(banner, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';


    ctx.globalAlpha = 1
    const botAvatar = await loadImage(message.client.user.displayAvatarURL({ format: 'png', dynamic: false, size: 256 }));
    drawCircularImage(ctx, botAvatar, 60, 50, 80);

    drawCircularFrame(ctx, 60, 50, 80, 4, overlayColor);

    const userAvatar = await loadImage(message.author.displayAvatarURL({ format: 'png', dynamic: false, size: 256 }));
    drawCircularImage(ctx, userAvatar, 480, 50, 80);

    drawCircularFrame(ctx, 480, 50, 80, 4, overlayColor);

    // Roll dice
    const botDiceNumber = Math.floor(Math.random() * 6) + 1;
    const userDiceNumber = Math.floor(Math.random() * 6) + 1;

    const [botDiceImage, userDiceImage] = await Promise.all([
      loadImage(getDiceImageUrl(botDiceNumber)), 
      loadImage(getDiceImageUrl(userDiceNumber))
    ]);
    ctx.drawImage(botDiceImage, 230, 75, 100, 100);
    ctx.drawImage(userDiceImage, 370, 75, 100, 100);

    // Determine winner
    let winner;
    let userMoney;
    if (botDiceNumber > userDiceNumber) {
      winner = message.client.user.username;
      await Data.subtract(`money_${message.author.id}`, amount);
    } else if (botDiceNumber < userDiceNumber) {
      winner = message.member.displayName;
      await Data.add(`money_${message.author.id}`, amount);
      userMoney = await Data.get(`money_${message.author.id}`) || 0;
    } else {
      winner = "تعادل";
    }

    // Add text to canvas
    ctx.font = "25px Cairo";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    if (winner === "تعادل") {
      ctx.fillText(winner, canvas.width / 2, 50);
    } else {
      ctx.fillText(winner === message.client.user.username ? "فزت عليك" : "لقد فزت", canvas.width / 2, 50);
    }

    await Data.set(`Dicegtime_${message.author.id}`, currentTime);
    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'نرد.png');

    const replyContent = winner === "تعادل" ? "تعادل!" :
      winner === message.client.user.username ? 
      `**💸 ${amount.toLocaleString('en-US')}$\n💵 ${userBalance.toLocaleString('en-US')}$**` :
      `**➡️ ${amount.toLocaleString('en-US')}$\n💵 ${userMoney.toLocaleString('en-US')}$**`;

    message.reply({
      files: [attachment],
      content: replyContent
    });
  }
};

// Helper functions
function drawCircularImage(ctx, image, x, y, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, x, y, radius * 2, radius * 2);
  ctx.restore();
}

function drawCircularFrame(ctx, x, y, radius, thickness, overlayColor) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius - thickness / 2, 0, Math.PI * 2, true);
  ctx.lineWidth = thickness;
  ctx.strokeStyle = overlayColor;
  ctx.stroke();
  ctx.restore();
}

function getDiceImageUrl(number) {
  const diceImages = {
    1: "./Settings/Images/dice1.png",
    2: "./Settings/Images/dice2.png",
    3: "./Settings/Images/dice3.png",
    4: "./Settings/Images/dice4.png",
    5: "./Settings/Images/dice5.png",
    6: "./Settings/Images/dice6.png"
  };
  return diceImages[number] || "./Settings/Images/dice1.png"; // Default image if number is invalid
}
