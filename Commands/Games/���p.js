const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js');
const Data = require('pro.db');
const { registerFont } = require('canvas');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });

module.exports = {
    name: 'تبرع',
    description: 'للتبرع بمبلغ محدد للأعضاء الذين لديهم رصيد',
    run: async (client, message, args) => {



        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply('إقل مبلغ للتبرع **1,000,000$**.');
        }


        
        const minimumAmount = 1000000;
        if (amount < minimumAmount) {
            return message.reply('تبي تتبرع وانت تبي الي يتصدق عليك؟');
        }

        let data = fs.readFileSync('database.json');
        let users = JSON.parse(data);

        const userId = `money_${message.author.id}`;
        if (!users[userId] || users[userId] < amount) {
            return message.reply('تبي تتبرع وانت تبي الي يتصدق عليك؟');
        }

        users[userId] -= amount;

        const eligibleUsers = Object.entries(users).filter(([key, value]) => key.startsWith('money_') && value > 0);

        if (eligibleUsers.length === 0) {
            return message.reply('كل الناس فل الفل خليك انت فحالك بس');
        }

        const donationAmountPerUser = Math.floor(amount / eligibleUsers.length);
        eligibleUsers.forEach(([userId]) => {
            users[userId] += donationAmountPerUser;
        });

        fs.writeFileSync('database.json', JSON.stringify(users, null, 2));

        const newSenderBalance = users[userId]; // تخزين رصيد الشخص بعد التبرع

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
        ctx.fillText(amount.toLocaleString('en-US'), 138, 361); 
        ctx.fillText(`${message.guild.name} Donation`, 150, 110);
        ctx.fillText(message.member.displayName, 140, 440);
        ctx.fillStyle = "#aba8a8";
        ctx.fillText("الآن", 1060, 110);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.font = "55px Cairo";
        ctx.fillText("مانقص مالاً من صدقة", 1150, 230);
        ctx.font = "40px Cairo";
        ctx.fillText(`، تم التبرع للفقراء بالسيرفر بنجاح`, 1150, 300);       
        const buffer = canvas.toBuffer();
        const attachment = new MessageAttachment(buffer, 'Cain.png');
        message.reply({ files: [attachment], content: `**💸 ${amount.toLocaleString('en-US')}\n💵 ${newSenderBalance.toLocaleString('en-US')}\n🙏 التبرعات وصلت لـ : \`${eligibleUsers.length}\` محتاج **` });
    },
};
