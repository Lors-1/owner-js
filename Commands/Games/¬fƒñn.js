const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment, MessageEmbed } = require("discord.js");
const Data = require('pro.db');

registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "زواجي",
  description: "عرض معلومات الزواج الخاصة بالمستخدم",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const user = message.author;

    const marriageInfo = await Data.get(`marriage_${user.id}`);
    if (!marriageInfo) {
      return message.reply("عزابي مو متزوج");
    }

    const spouse = await client.users.fetch(marriageInfo.spouse);
    const amount = marriageInfo.dowry;

    const canvas = createCanvas(600, 700);
    const ctx = canvas.getContext('2d');

    const ring = await loadImage('./Settings/Images/ring.png');
    const contract = await loadImage('./Settings/Images/contract.png');
    const overlayColor = Data.get(`bankcolor-${message.guild.id}`)
    ctx.drawImage(contract, 0, 0, 600, 700); 
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = overlayColor; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over'; 
    ctx.drawImage(ring, 0, 0, 600, 700); 

    ctx.fillStyle = "#ffffff";
    ctx.font = "35px Cairo";
    ctx.fillText(`عقد زواج`, 230, 160);
    ctx.font = "25px Cairo";
    ctx.fillText(`تم عقد زواج كلاّ من `, 180, 205);
    ctx.fillText(`بالمهر المدون اسفلاً، وذالك بالتراضى\nبين الطرفين وشهيد ذالكـ الجميع`, 80, 500);
    ctx.textAlign = "left";
    ctx.fillText(`${amount.toLocaleString('en-US')}$`, 250, 570);
    ctx.fillText(message.author.username, 150, 415);
    ctx.textAlign = "left";
    ctx.fillText(spouse.username, 380, 415);

    const avatar1 = await loadImage(user.displayAvatarURL({ format: 'png' }));
    const avatar2 = await loadImage(spouse.displayAvatarURL({ format: 'png' }));
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
    const attachment = new MessageAttachment(buffer, 'marriage_certificate.png');
    await message.reply({ content: `<@${message.author.id}> 💏 ${spouse}`, files: [attachment] });


    // const embed = new MessageEmbed()
    //   .setDescription(`**معلومات الزواج\nالزوج: ${spouse}\nالمهر: ${amount.toLocaleString('en-US')}$**`)
    //   .setImage(`attachment://marriage_certificate.png`);

    // message.channel.send({ embeds: [embed], files: [attachment] });
    
  },
};
