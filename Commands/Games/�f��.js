const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const Data = require('pro.db');

registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "زواج",
  description: "عرض طلب زواج لفتاة معينة وتحديد المبلغ للزواج",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const bride = message.mentions.users.first();
    if (!bride) return message.reply("منشن فتاة الاحلام وحط المهر");

    if (bride.bot) return message.reply("مريض انت تتزوج بوت؟");

    if (bride.id === message.author.id) {
      return message.reply("غبي انت؟ بتتزوج نفسك؟");
    }

    const isMarried = await Data.get(`marriage_${bride.id}`);
    if (isMarried) {
      return message.reply(`يعوضك الله يا وحش متزوجة`);
    }

    const isGroomMarried = await Data.get(`marriage_${message.author.id}`);
    if (isGroomMarried) {
      return message.reply(`ياخاين عايز تتجوز ع مراتك؟؟`);
    }
    
    
    let amount = 0;

    if (args[1]) {
        if (args[1].toLowerCase() === "نصف" || args[1].toLowerCase() === "نص") {
          amount = Math.floor(await Data.get(`money_${message.author.id}`) / 2);
        } else if (args[1].toLowerCase() === "ربع") {
          amount = Math.floor(await Data.get(`money_${message.author.id}`) / 4);
        } else if (args[1].toLowerCase() === "كامل" || args[1].toLowerCase() === "كل") {
          amount = await Data.get(`money_${message.author.id}`);
        } else {
          amount = parseInt(args[1]);
        }
    }
    
    if (isNaN(amount) || amount < 5000) {
      return message.reply("أقل مهر للزواج هو **5000$**.");
    }
    

    const groomBalance = await Data.get(`money_${message.author.id}`) || 0;
    if (groomBalance < amount) {
        return message.reply("استر نفسك بعدها فكر بالزواج");
    }

    const embed = new MessageEmbed()
      .setDescription(`**طلب زواج\nمن: ${message.author}\nإلى: ${bride}\nالمبلغ: ${amount.toLocaleString('en-US')}$**`)
      .setThumbnail("https://g.top4top.io/p_3185zvf9b1.png");

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('accept')
          .setEmoji("<:15:1286609528506552372>")
          .setStyle('SECONDARY')
      )
      .addComponents(
        new MessageButton()
          .setCustomId('reject')
          .setEmoji("<:16:1286609456188227604>")
          .setStyle('SECONDARY')
      );

    const msg = await message.reply({ embeds: [embed], components: [row], content: ` ${bride}` });

    const filter = i => i.user.id === bride.id;

    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
      const { customId } = interaction;
      if (customId === 'accept') {
        await Data.add(`money_${bride.id}`, amount);
        await Data.subtract(`money_${message.author.id}`, amount);

        await Data.set(`marriage_${bride.id}`, {
          spouse: message.author.id,
          dowry: amount,
          husband: message.author.id, // تحديد الزوج
          husbandGender: 'male' // تحديد جنس الزوج
        });


        await Data.set(`marriage_${message.author.id}`, {
          spouse: bride.id,
          dowry: amount,
          husband: bride.id, // تحديد الزوجة
          husbandGender: 'male' // تحديد جنس الزوجة
        });
        
        await Data.set(`marriage_${bride.id}`, {
          spouse: message.author.id,
          dowry: amount,
          husband: bride.id, // تحديد الزوجة
          husbandGender: 'female' // تحديد جنس الزوجة
        });

        const canvas = createCanvas(600, 700);
        const ctx = canvas.getContext('2d');

        const ring = await loadImage('./Settings/Images/ring.png');
        const contract = await loadImage('./Settings/Images/contract.png');
        const overlayColor = Data.get(`bankcolor-${message.guild.id}`)
        ctx.drawImage(contract, 0, 0, 600, 700); 
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = overlayColor; // استخدام اللون المعرف
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over'; 
        ctx.drawImage(ring, 0, 0, 600, 700); 
    
        ctx.fillStyle = "#ffffff";
        ctx.font = "35px Cairo";
         ctx.fillText(`عقد زواج`, 230, 160);
         ctx.font = "25px Cairo";
         ctx.fillText(`تم عقد زواج كلاّ من `, 180, 205);
         ctx.fillText(`بالمهر المدون اسفلاً، وذالك بالتراضى\nبين الطرفين وشهيد ذالكـ الجميع`, 105, 500);
         ctx.textAlign = "left";
         ctx.fillText(`${amount.toLocaleString('en-US')}$`, 250, 570);
         ctx.fillText(message.author.username, 150, 415);
         ctx.textAlign = "left";
         ctx.fillText(bride.username, 395, 415);

  
         const Canvas = require('canvas');
         const avatar1 = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'png' }));
         const avatar2 = await Canvas.loadImage(bride.displayAvatarURL({ format: 'png' }));
         const radius = 70; // Define the radius of the circular images

         function drawCircularImage(ctx, image, x, y, radius) {
            ctx.save(); // Save the current drawing state
            ctx.beginPath(); // Begin a new path
            ctx.arc(x + radius, y + radius, radius + 2, 0, Math.PI * 2, true); // Create a circular path slightly larger than the avatar
            ctx.strokeStyle = overlayColor; // Set the stroke color to white
            ctx.lineWidth = 4; // Set the border width
            ctx.stroke(); // Draw the border
            ctx.closePath(); // Close the path
        
            ctx.beginPath(); // Begin a new path
            ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true); // Create a circular clipping path
            ctx.closePath(); // Close the path
            ctx.clip(); // Clip the current context to the circular path
            ctx.drawImage(image, x, y, radius * 2, radius * 2); // Draw the image inside the clipping path
            ctx.restore(); // Restore the previous drawing state
        }
        

        drawCircularImage(ctx, avatar1, 110, 220, radius); // Draw the first image
        drawCircularImage(ctx, avatar2, 355, 220, radius); // Draw the second image


        const buffer = canvas.toBuffer();
        const attachment = new MessageAttachment(buffer, 'Cain.png');

        await interaction.reply({ content: `<@${message.author.id}> 💍 <@${bride.id}>`, files: [attachment] });
        msg.edit("**🥳 مبرووك تم عقد الزواج .**")
    
} else if (customId === 'reject') {
          msg.edit(`**تم رفض طلب الزواج. **`)
        await interaction.reply({ content: `** باقي ماجا الشخص المناسب**`, ephemeral: true });
      }

      row.components.forEach(component => {
        component.setDisabled(true);
        component.setStyle('SECONDARY');
      });

      await interaction.message.edit({ embeds: [embed], components: [row] });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        msg.edit("**ما يبيك  ** ");
        row.components.forEach(component => component.setDisabled(true));
        msg.edit({ components: [row] });
      }
    });
  },
};
