const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment, MessageEmbed } = require("discord.js");
const Data = require('pro.db');

registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "خلع",
  description: "قم بطلب الطلاق في حال كنت متزوجًا",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const isMarried = await Data.get(`marriage_${message.author.id}`);
    if (!isMarried) {
      return message.reply("مو متزوجة عشان تطلق");
    }


    const marriageData = await Data.get(`marriage_${message.author.id}`);
    const spouseId = marriageData.spouse;
    const husbandGender = marriageData.husbandGender;

    if (husbandGender !== 'female') {
      return message.reply("الخلع بيد الزوجة عزيزي");
    }

    // Delete marriage data for both spouses
    await Data.delete(`marriage_${message.author.id}`);
    await Data.delete(`marriage_${spouseId}`);

    const canvas = createCanvas(600, 700);
    const ctx = canvas.getContext('2d');


    const brokenHeart = await loadImage('./Settings/Images/divorce.png');
    const divorcePapers = await loadImage('./Settings/Images/contract.png');
    const overlayColor = Data.get(`bankcolor-${message.guild.id}`);
    ctx.drawImage(divorcePapers, 0, 0, 600, 700);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(brokenHeart, 0, 0, 600, 700);

    ctx.fillStyle = "#ffffff";
    ctx.font = "35px Cairo";
    ctx.fillText(`وثيقة الطلاق`,210, 160);
    ctx.font = "25px Cairo";
    ctx.fillText(`عوافي تصير بأرقى العوايل`, 160, 205);
    ctx.fillText(`في يوم من الايام كنا مجتميع علي\nخير ولاكن قدر الله انكم تنفصلون.`, 120, 500);
    ctx.textAlign = "left";
    ctx.fillText(`${message.author.username}`, 150, 415);
    ctx.textAlign = "left";

    const spouse = await client.users.fetch(spouseId);
    ctx.fillText(spouse.username, 395, 415);

    const Canvas = require('canvas');
    const avatar1 = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'png' }));
    const avatar2 = await Canvas.loadImage(spouse.displayAvatarURL({ format: 'png' }));
    const radius = 70;

    function drawCircularImage(ctx, image, x, y, radius) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius + 2, 0, Math.PI * 2, true);
      ctx.strokeStyle = overlayColor;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, x, y, radius * 2, radius * 2);
      ctx.restore();
    }

    drawCircularImage(ctx, avatar1, 110, 220, radius); // Draw the first image
    drawCircularImage(ctx, avatar2, 355, 220, radius); // Draw the second image

    const buffer = canvas.toBuffer();
    const attachment = new MessageAttachment(buffer, 'Cain.png');

    const msg = await message.reply({ files: [attachment], content: ` ${spouse}` });
    message.channel.send(``);
  },
};
