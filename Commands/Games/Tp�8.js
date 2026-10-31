const { MessageEmbed } = require('discord.js');
const Data = require('pro.db');

module.exports = {
  name: "لعبة",
  aliases: ["لعبه"], // إضافة الاختصار
  description: "لعبة حجرة ورقة مقص",
  run: async (client, message, args) => {

    let setchannel = await Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return;

    const lastGameTime = await Data.get(`gametime_${message.author.id}`) || 0;
    const currentTime = Date.now();
    const timeDifference = currentTime - lastGameTime;
    const cooldownTime = 240000; 

    if (timeDifference < cooldownTime) {
      const remainingTime = cooldownTime - timeDifference;
      const minutes = Math.floor(remainingTime / (1000 * 60));
      const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
      return message.reply(`⌛ يرجى الانتظار \`${minutes} دقائق ${seconds} ثواني\` قبل استخدام الأمر مرة أخرى.`);
    }

    const isBlocked = await Data.get(`blocked_${message.author.id}`);
    if (isBlocked) return message.react("🔒");
    
    await Data.set(`gametime_${message.author.id}`, currentTime);

    const emojis = ["🧱", "📰", "✂️"];
    const color = await Data.get(`bankcolor-${message.guild.id}`) || '#01b8ff'; // لون افتراضي

    const gameEmbed = new MessageEmbed()
      .setTitle("حجرة, ورقة, مقص")
      .setDescription("اختر حجرة (🧱) أو ورقة (📰) أو مقص (✂️) عن طريق كتابة الخيار في الدردشة.")
      .setColor(color) // استخدام اللون المستدعى من قاعدة البيانات
      .setFooter("عند الفوز ستحصل على **1000$** وعند الخسارة أو التعادل تروح عليك الألف");

    await message.reply({ embeds: [gameEmbed] });

    // جمع خيار اللاعب من الدردشة
    const filter = response => emojis.includes(response.content) && response.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

    const userChoice = collected.first().content;
    const botChoice = emojis[Math.floor(Math.random() * emojis.length)];
    let resultMessage, resultColor, addedAmount;

    if ((botChoice === "📰" && userChoice === "✂️") ||
        (botChoice === "🧱" && userChoice === "📰") ||
        (botChoice === "✂️" && userChoice === "🧱")) {
      resultMessage = `✅ لقد فزت وكسبت **1000$**\nانت أخترت ${userChoice}, انا اخترت ${botChoice}`;
      resultColor = "#55bd55";
      addedAmount = 1000;
    } else {
      resultMessage = `❌ لقد خسرت راحت عليك الـ **1000$**\nانت أخترت ${userChoice}, انا اخترت ${botChoice}`;
      resultColor = "#cc5c7d";
      addedAmount = 0; 
    }

    const previousBalance = await Data.get(`money_${message.author.id}`) || 0;
    const newBalance = previousBalance + addedAmount;
    await Data.set(`money_${message.author.id}`, newBalance);

    const resultEmbed = new MessageEmbed()
      .setColor(resultColor)
      .setTitle("حجرة, ورقة, مقص")
      .setDescription(resultMessage);
    
    await message.channel.send({ embeds: [resultEmbed] });
  }
};
