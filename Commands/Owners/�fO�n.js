const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { prefix, owners, serverInvite } = require(`${process.cwd()}/config`);
const Data = require('pro.db');

module.exports = {
    name: 'اوامري',
    aliases: ["قائمة"],
    run: async (client, message, args) => {
        // تحقق مما إذا كان المستخدم هو مالك البوت
        if (!owners.includes(message.author.id)) return message.react('🔒');

        // استدعاء اللون من قاعدة البيانات
        const overlayColor = await Data.get(`bankcolor-${message.guild.id}`) || '#01b8ff';

        // تحقق مما إذا كان المستخدم محظورًا
        const isBlocked = await Data.get(`blocked_${message.author.id}`);
        if (isBlocked) return message.react("🔒");

        // رسالة التعليمات
        const helpMessage = `**
سماح : فك المنع عن الشخص
منع : لمنع شخص من اللعب
ممنوعين : قائمة الممنوعين من اللعب
تصفير : تصفير اموال شخص معين
خصم : خصم مبلغ معين من الاعب
تطفير : تفليس جميع الاعضاء
عطه : اعطاء شخص معين المال
حولات : تفعيل او ايقاف الحولات
مدير : اضافه مدير اسبوعي
المدير : المدير الاسبوعي
تعطيل : تعطيل البنك
setbank :  تحديد شات البنك
setlog :  تحديد لوق البنك
setback :  تحديد خلفية البنك
setcolor : تحديد لون البنك
setprefix :  تحديد البرفكس
cmunprefix : ازاله البرفكس
setavatar :  تحديد افتار البوت
setname :  تغير اسم البوت
setserver: : تغير سيرفر البوت
owners :  الاونرات في البوت
setowner :  اضافة اونر
setstatus :  تغير حاله البوت 
rest :  اعادة تعين بيانات البنك
restart :  اعاده تشغيل البوت 
       ** `; // إضافة المزيد من الأوامر هنا

        // إنشاء Embed لعرض الأوامر
        const helpEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setTitle("أوامر البوت")
            .setDescription(helpMessage)
            .setColor(overlayColor)
            .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });

        // إرسال الرسالة
        message.reply({ embeds: [helpEmbed] });
    }
};
