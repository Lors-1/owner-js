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
            .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

        // إرسال الرسالة
        message.reply({ embeds: [helpEmbed] });
    }
};
