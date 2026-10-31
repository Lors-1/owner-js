const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { get, set } = require('pro.db');
const Data = require('pro.db');
module.exports = {
  name: "لون",
  description: "لعبة وحد جميع المكعبات إلى لون واحد",
  run: async (client, message, args) => {
    try {
      let setchannel = await Data.get(`chatbank_${message.guild.id}`);
      if (message.channel.id !== setchannel) return;

      let times = await get("times") || {};
      let bank = await get("bank") || {};

      const cooldown = 300000; // Cooldown لمدة 5 دقائق
      const lastPlayTime = times[`لون_${message.guild.id}_${message.author.id}`] || 0;
      const currentTime = Date.now();
      const timeDifference = currentTime - lastPlayTime;

      if (timeDifference < cooldown) {
        const remainingTime = cooldown - timeDifference;
        const minutes = Math.floor(remainingTime / (1000 * 60));
        const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
        return message.reply(`⌛ تعال بعد \`${minutes} دقائق ${seconds} ثانية\``);
      }

      // إعداد اللعبة
      const colors = ["🟥", "🟦", "🟧", "🟪", "🟩", "⬛", "⬜", "🟨"];
      const correctColor = colors[Math.floor(Math.random() * colors.length)];

      // اختيار ألوان عشوائية لتظهر في الأزرار
      const selectedColors = [];
      while (selectedColors.length < 8) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        if (!selectedColors.includes(color)) {
          selectedColors.push(color);
        }
      }

      const gameEmbed = new MessageEmbed()
        .setTitle("اختر اللون الصحيح")
        .setDescription(`اللون الصحيح هو: ${correctColor}\n\nاضغط على الزر الذي يتطابق مع اللون الظاهر في الأسفل:`)
        .setColor("#01b8ff")
        .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

      // نصوص قصيرة للأزرار واللون الرمادي
      const buttons = selectedColors.map(color => 
        new MessageButton()
          .setCustomId(color)
          .setLabel(color)
          .setStyle('SECONDARY')
      );

      // تقسيم الأزرار إلى صفين
      const row1 = new MessageActionRow().addComponents(buttons.slice(0, 4));
      const row2 = new MessageActionRow().addComponents(buttons.slice(4, 8));

      // إرسال رسالة مع المربع العلوي والألوان
      const sentMessage = await message.reply({ embeds: [gameEmbed], components: [row1, row2] });

      const filter = (interaction) => interaction.user.id === message.author.id && selectedColors.includes(interaction.customId);
      const collector = sentMessage.createMessageComponentCollector({ filter, max: 1, time: 15000 });

      collector.on('collect', async (interaction) => {
        const chosenColor = interaction.customId;
        let resultMessage, resultColor, amountChange;

        if (chosenColor === correctColor) {
          resultMessage = `✅ لقد فزت! اللون الصحيح كان ${correctColor}`;
          resultColor = "#01b8ff";
          amountChange = 1500; // إضافة 1500 عند الفوز
          
          // تحديث عدد مرات الفوز
          let wins = bank[`wins_${message.author.id}`] || 0;
          bank[`wins_${message.author.id}`] = wins + 1;
          // تحديث عدد مرات الفوز للعبة اللون
          let colorWins = bank[`colorWins_${message.author.id}`] || 0;
          bank[`colorWins_${message.author.id}`] = colorWins + 1;
        } else {
          resultMessage = `❌ لقد خسرت. اللون الصحيح كان ${correctColor}`;
          resultColor = "#01b8ff";
          amountChange = -1000; // خصم 1000 عند الخسارة
          
          // تحديث عدد مرات الخسارة
          let losses = bank[`losses_${message.author.id}`] || 0;
          bank[`losses_${message.author.id}`] = losses + 1;
        }

        let currency = bank[`money_${message.author.id}`] || 0;
        bank[`money_${message.author.id}`] = currency + amountChange;
        await set("bank", bank);

        const resultEmbed = new MessageEmbed()
          .setTitle("نتيجة اللعبة")
          .setDescription(`${resultMessage}\n\nالمبلغ الذي ${chosenColor === correctColor ? "فزت" : "خسرت"} به: ${amountChange}\nعدد مرات الفوز: ${bank[`wins_${message.author.id}`] || 0}\nعدد مرات الخسارة: ${bank[`losses_${message.author.id}`] || 0}`)
          .setColor(resultColor)
          .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

        await interaction.update({ embeds: [resultEmbed], components: [] });

        times[`لون_${message.guild.id}_${message.author.id}`] = currentTime;
        await set("times", times);
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new MessageEmbed()
            .setTitle("انتهت المدة")
            .setDescription(`لم تقم بالاختيار. اللون الصحيح كان ${correctColor}`)
            .setColor("#01b8ff")
            .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

          sentMessage.edit({ embeds: [timeoutEmbed], components: [] });
        }
      });

    } catch (error) {
      console.error("Error running the game command:", error);
      message.reply("حدث خطأ أثناء تشغيل اللعبة.");
    }
  },
};
