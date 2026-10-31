const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const Data = require('pro.db');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
  name: "رهان",
  description: "عمل رهان مع شخص معين وتحديد المبلغ",
  run: async (client, message, args) => {

    let setchannel = Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastClaimTime = await Data.get(`bettime_${message.author.id}`) || 0;
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

    const opponent = message.mentions.users.first();
    if (!opponent) return message.reply("منشن الذي تريد اللعب معه وحدد المبلغ.");
    
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
    
      if (isNaN(amount) || amount <= 0) {
        return message.reply("أقل مبلغ للعب هو **1000$**");
      }
    } else {
      return message.reply("من فضلك حدد المبلغ.");
    }
    
    const senderBalance = await Data.get(`money_${message.author.id}`) || 0;
    if (senderBalance < amount) return message.reply("عذرًا، ليس لديك الرصيد الكافي للرهان.");
    
    if (opponent.id === message.author.id) {
      return message.reply("لن تستطيع اللعب مع نفسك.");
    }

    const embed = new MessageEmbed()
      .setDescription(`**طلب لعب رهان \nمع: ${opponent}\nالمبلغ: ${amount.toLocaleString('en-US')}**`)
      .setThumbnail("https://c.top4top.io/p_3185dto0z1.png");

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('accept')
          .setEmoji("<:43:1286610454680047637>")
          .setStyle('SECONDARY')
      )
      .addComponents(
        new MessageButton()
          .setCustomId('reject')
          .setEmoji("<:41:1286610453014773842>")
          .setStyle('SECONDARY')
      );

    const msg = await message.reply({ embeds: [embed], components: [row], content: `<@${message.author.id}> 🎲 ${opponent}` });

    const filter = i => i.user.id === opponent.id;

    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    let buttonClicked = false;

    collector.on('collect', async interaction => {
      const { customId } = interaction;
      if (!buttonClicked) {
        buttonClicked = true;
        if (customId === 'accept') {
          const opponentBalance = await Data.get(`money_${opponent.id}`) || 0;
          if (opponentBalance < amount) {
              await interaction.reply({content: `**تعيش وتاخد غيرها 🙂**`, ephemeral: true});
              msg.edit("**الآخ ع الحديدة معهوش فلوس 🤡**");

              row.components.forEach(component => {
                  component.setDisabled(true);
                  component.setStyle('SECONDARY');
              });

              await interaction.message.edit({ 
                  embeds: [embed], 
                  components: [row] 
              });
              
              return;
          }

          Data.set(`bettime_${message.author.id}`, currentTime);

          const users = [message.author.id, opponent.id];
          const winnerIndex = Math.floor(Math.random() * users.length);
          const winnerID = users[winnerIndex];
          const loserID = users.find(id => id !== winnerID);

          await Data.add(`money_${winnerID}`, amount);
          await Data.subtract(`money_${loserID}`, amount);

          // تحديث عدد مرات الفوز والخسارة
          if (winnerID === message.author.id) {
            let betWins = await Data.get(`betWins_${message.author.id}`) || 0;
            await Data.set(`betWins_${message.author.id}`, betWins + 1);
            let losses = await Data.get(`losses_${opponent.id}`) || 0;
            await Data.set(`losses_${opponent.id}`, losses + 1);
          } else {
            let betWins = await Data.get(`betWins_${opponent.id}`) || 0;
            await Data.set(`betWins_${opponent.id}`, betWins + 1);
            let losses = await Data.get(`losses_${message.author.id}`) || 0;
            await Data.set(`losses_${message.author.id}`, losses + 1);
          }

          const canvas = createCanvas(1220, 512);
          const ctx = canvas.getContext('2d');

          const winnerMember = message.guild.members.cache.get(winnerID);
          const winnerName = winnerMember ? winnerMember.displayName : "فيروز";
          const winnerBalance = await Data.get(`money_${winnerID}`) || 0; 
          
          const moneyImage = await loadImage('./Settings/Images/money.png');
          const background = await loadImage('./Settings/Images/wage.png');
          const overlayColor = await Data.get(`bankcolor-${message.guild.id}`);
          ctx.drawImage(background, 0, 0, 1220, 512); 
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = overlayColor; // استخدام اللون المعرف
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over'; 
          ctx.drawImage(moneyImage, 0, 0, 1220, 512); 

          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "left";
          ctx.font = "45px Cairo";
          ctx.fillText(`${message.guild.name} Pay`, 150, 110);
          ctx.fillText(amount.toLocaleString('en-US'), 138, 361); 
          ctx.fillText(winnerName, 140, 440);
          ctx.fillStyle = "#aba8a8";
          ctx.fillText("الآن", 1060, 110);
          ctx.fillStyle = "#ffffff";
          ctx.fillText("لقد فزت بالرهان !!", 807, 230);
          ctx.font = "55px Cairo";
          ctx.font = "50px Cairo";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "right";
          ctx.font = "40px Cairo";
          ctx.fillText("تم إيداع المبلغ في حسابك، لكن إنتبه احد يزرفك", 1150, 290);
          const buffer = canvas.toBuffer();
          await msg.delete();
          await message.reply({ files: [buffer], content: `**🥳 <@${winnerID}>\n➡️ ${amount.toLocaleString('en-US')}$\n💵 ${winnerBalance.toLocaleString('en-US')}**` });

        } else if (customId === 'reject') {
          msg.edit("**رفض اللعب معك ما يبي يخسر 😝**");
          row.components.forEach(component => {
              component.setDisabled(true);
              component.setStyle('SECONDARY');
          });
          await interaction.message.edit({ 
              embeds: [embed], 
              components: [row] 
          });

          await interaction.reply({ 
              content: 'أنت صح', 
              ephemeral: true 
          });

          setTimeout(async () => {
              await interaction.deleteReply();
          }, 5000);
        }
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0 && !buttonClicked) {
        msg.edit("لم يتم الاختيار.");
        row.components.forEach(component => component.setDisabled(true));
        msg.edit({ components: [row] });
      }
    });
  },
};
