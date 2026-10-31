const { MessageEmbed } = require("discord.js");
const Data = require('pro.db');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./Settings/Fonts/Cairo.ttf', { family: 'Cairo' });
const Discord = require("discord.js");

const companies = [
    { name: 'شركة آبل',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175765/zcwjpxmdb70m4appthcq.png' },
    { name: 'شركة مايكروسوفت',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175761/eglsmw4dnetcspnqcisf.png' },
    { name: 'شركة امازون',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175763/exxgtytfid9azt9stoao.png' },
    { name: 'شركة فيسبوك',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175761/zemhsiz0zubokw3pv9li.png' },
    { name: 'شركة قوقل', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175762/ltjvtrthbyy6bqpjjbez.png' },
    { name: 'شركة تويتر',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175762/saphq7u78i3ksr8egucu.png' },
    { name: 'شركة نتفليكس',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175761/scidpsvahbwxp0l66db5.png' },
    { name: 'شركة سوني',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175762/qpgx4bfqdqwpegk6xjb5.png' },
    { name: 'شركة تويوتا',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175762/dcwu6pvnlfoenehsf2ca.png' },
    { name: 'شركة اديداس', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175763/hfksqpr6jyr12e91aqjg.png' },
    { name: 'شركة بي ام دبليو',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175763/bykhzu8atfd9n4b8oarr.png' },
    { name: 'شركة انستقرام',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175764/d0rmdvlqbcbg9peixjxs.png' },
    { name: 'شركة كارفور',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175761/f80kvf0nhlrcle0vutja.png' },
    { name: 'شركة غوتشي', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175761/toi8lwr8bnwte87twxae.png' },
    { name: 'شركة بيتكوين', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175764/o3oegg62cbmdwqjpnutx.png' },
    { name: 'شركة سبوتيفاي',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175763/hifi4i8asqof7b4thwz2.png' },
    { name: 'شركة واتساب',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175764/qnl0lgjgoiwzcdfgjrkj.png' },
    { name: 'شركة شانجان',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175764/b7emojxzkdekw7yvrcvn.png' },
    { name: 'شركة ماستركارد',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175763/zkgoonsizss8cftltzgl.png' },
    { name: 'شركة يوتيوب',  logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175764/ulylqljhvhymxxwq5ijv.png' },
    { name: 'شركة فورد', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175762/pksmxevvq6z6ki4jqdvq.png' },
    { name: 'شركة نايك', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175762/gwjwkf2pzho5uwuximft.png' },
    { name: 'شركة ماكدونالدز ', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175761/khwct4f03jojli2okfpt.png' },
    { name: 'شركة مرسيدس', logo: 'https://res.cloudinary.com/ddjviolpu/image/upload/v1722175764/teo9utduf23srbpukwu6.png' },
];
module.exports = {
    name: "تداول",
    description: "استثمار مبلغ معين والفوز أو الخسارة بنسبة مئوية",
    run: async (client, message, args) => {
        let setchannel = Data.get(`chatbank_${message.guild.id}`);
        if (message.channel.id !== setchannel) return;

        const lastClaimTime = await Data.get(`Tradetime_${message.author.id}`) || 0;
        const currentTime = Date.now();
        const timeDifference = currentTime - lastClaimTime;

        // تحقق من وقت الانتظار
        if (timeDifference < 300000) { 
            const remainingTime = 300000 - timeDifference;
            const minutes = Math.floor(remainingTime / (1000 * 60));
            const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
            return message.reply(`⌛ خف شوي\`${minutes} دقائق ${seconds} ثانية\``);
        }

        const isBlocked = await Data.get(`blocked_${message.author.id}`);
        if (isBlocked) return message.react("🔒");

        let amount = 0;
        const userBalance = await Data.get(`money_${message.author.id}`) || 0;

        if (args.length === 0 || userBalance < 1000) {
            return message.reply("يرجى إدخال مبلغ أو كلمة مثل 'كامل' أو 'نصف' أو 'ربع'. وأقل مبلغ للعب هو **1000$**");
        }

        // تحديد المبلغ
        if (args[0].toLowerCase() === "نصف" || args[0].toLowerCase() === "نص") {
            amount = Math.floor(userBalance / 2);
        } else if (args[0].toLowerCase() === "ربع") {
            amount = Math.floor(userBalance / 4);
        } else if (args[0].toLowerCase() === "كامل" || args[0].toLowerCase() === "كل") {
            amount = userBalance;
        } else {
            amount = parseInt(args[0]);
        }

        if (isNaN(amount) || amount < 1000) {
            return message.reply("اقل مبلغ للعب هو **1000$**");
        }

        if (userBalance < amount) {
            return message.reply("ما معك يا طفران");
        }

        const selectedCompany = companies[Math.floor(Math.random() * companies.length)];
        const isWin = Math.random() < 0.5;
        const profitPercentage = Math.random() * 0.3 + 0.1; // نسبة ربح عشوائية بين 10% و 40%
        const lossPercentage = Math.random() * 0.2 + 0.05; // نسبة خسارة عشوائية بين 5% و 25%
        
        const profitAmount = isWin ? Math.floor(amount * profitPercentage) : 0; // الربح
        const lossAmount = !isWin ? Math.floor(amount * lossPercentage) : 0; // الخسارة
        const updatedBalance = isWin ? userBalance + profitAmount : userBalance - lossAmount; // تحديث الرصيد

        // إنشاء القماش
        const canvas = createCanvas(1220, 512);
        const ctx = canvas.getContext('2d');

        // تحميل الصور
        const background = await loadImage('./Settings/Images/monlo.png');
        const Rapids = await loadImage('./Settings/Images/Rapids.png');
        const companyLogo = await loadImage(selectedCompany.logo);

        // رسم الخلفيات
        ctx.drawImage(background, 0, 0, 1220, 512);
        ctx.drawImage(Rapids, 0, 0, 1220, 512); 

        // إعداد اللون
        const overlayColor = await Data.get(`bankcolor-${message.guild.id}`) || "#01b8ff";
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over'; 

        // رسم الشعار مع الشفافية الخاصة به
        ctx.globalAlpha = 0.8; // ضبط شفافية الشعار
        ctx.drawImage(companyLogo, 100, 198, 200, 200); // حجم الشعار وموقعه
        ctx.globalAlpha = 1; // إعادة الشفافية إلى 1 بعد رسم الشعار

        // إعداد النص
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.font = "45px Cairo"; 
        ctx.globalAlpha = 0.9; // ضبط شفافية النص
        ctx.fillText(`${message.guild.name} Pay`, 150, 110); 

        ctx.fillStyle = "#aba8a8";
        ctx.fillText("الآن", 1060, 110); 

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "40px Cairo";
        ctx.fillText(`الشركة: ${selectedCompany.name}`, canvas.width / 1.3, 270);

        ctx.font = "40px Cairo"; // حجم النص أكبر
        ctx.fillText(`${isWin ? 'تداول رابح' : 'تداول خاسر'}`, canvas.width / 2.1, 199);
        
        // إضافة اسم الشخص على الصورة
        ctx.fillText(`اسم اللاعب: ${message.author.username}`, canvas.width / 1.3, 320);

        // إعداد المرفق
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'result.png');
        await Data.set(`Tradetime_${message.author.id}`, currentTime); // تحديث وقت التداول

        // تحديث الرصيد في قاعدة البيانات
        await Data.set(`money_${message.author.id}`, updatedBalance);

        // إعداد محتوى الرسالة بشكل يتطابق مع الصورة
        const content = isWin 
            ? `** تداول رابح\nربح :  ${profitAmount.toLocaleString('en-US')}$\n الرصيد الحالي:  ${updatedBalance.toLocaleString('en-US')}$**` 
            : `** تداول خاسر\nخسارة :  ${lossAmount.toLocaleString('en-US')}$ \nالرصيد الحالي :  ${updatedBalance.toLocaleString('en-US')}$**`;

        // إرسال الرسالة مع المحتوى والمرفق
        message.reply({ content, files: [attachment] });
    }
};
