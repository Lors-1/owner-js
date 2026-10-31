const { MessageButton, MessageActionRow } = require('discord.js');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "setavatar",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('');

        const avatarReply = await message.channel.send(`<@${message.author.id}> - يرجى إرفاق الصورة الجديدة، ملاحظة: يجب أن تكون الصورة مرفقة كـ صورة وليس رابط وأن يكون حجم الصورة أقل من 10 ميغابايت`);

        // إنشاء زر الإلغاء
        const cancelButton = new MessageButton()
            .setCustomId('cancelAvatarChange')
            .setLabel('الغاء')
            .setStyle('DANGER');

        // إنشاء صف الأزرار
        const actionRow = new MessageActionRow().addComponents(cancelButton);

        // تحديث رسالة الرد مع الزر
        await avatarReply.edit({ content: `<@${message.author.id}> - يرجى إرفاق الصورة الجديدة، ملاحظة: يجب أن تكون الصورة مرفقة كـ صورة وليس رابط وأن يكون حجم الصورة أقل من 10 ميغابايت`, components: [actionRow] });

        // تعيين متغير لحالة الزر
        let isButtonDisabled = false;

        const filter = (msg) => msg.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 }); // مدة الانتظار 60 ثانية

        collector.on('collect', async (msg) => {
            // في حالة الرد بصورة
            if (msg.attachments.size > 0) {
                const attachment = msg.attachments.first();
                const avatarURL = attachment.url;
                try {
                    await client.user.setAvatar(avatarURL);
                    await avatarReply.edit("**تم تغير صورة البوت الآن.** ☑️");
                    msg.delete();
                    // تعيين الزر كمعطل بعد تغيير الصورة
                    isButtonDisabled = true;
                } catch (error) {
                    console.error(error);
                    await avatarReply.edit("**حدث خطأ أثناء تغيير صورة البوت. يرجى المحاولة مرة أخرى.**");
                }
            } 
            // في حالة الرد برابط للصورة
            else if (msg.content.startsWith("http")) {
                const avatarURL = msg.content;
                try {
                    await client.user.setAvatar(avatarURL);
                    await avatarReply.edit("**تم تغير صورة البوت الآن.** ☑️");
                    msg.delete();
                    // تعيين الزر كمعطل بعد تغيير الصورة
                    isButtonDisabled = true;
                } catch (error) {
                    console.error(error);
                    await avatarReply.edit("**حدث خطأ أثناء تغيير صورة البوت. يرجى المحاولة مرة أخرى.**");
                }
            } else {
                await avatarReply.edit("**يرجى ارفاق الصورة أو إرسال رابط للصورة.**");
            }
            collector.stop(); // إيقاف جمع الرسائل بمجرد الحصول على رسالة واحدة
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                avatarReply.edit("**لم يتم إرسال صورة في الوقت المناسب.** ⌛");
            }
        });

        // إضافة معالج لزر الإلغاء
        const buttonCollector = message.channel.createMessageComponentCollector({ time: 60000 });
        buttonCollector.on('collect', async interaction => {
            if (interaction.customId === 'cancelAvatarChange') {
                await avatarReply.edit("**تم الغاء تغيير صورة البوت.** ❌");
                collector.stop();
                buttonCollector.stop();
            }
        });

        buttonCollector.on('end', () => {
            if (!avatarReply.deleted) {
                avatarReply.delete().catch(console.error);
            }
        });

        // تحديث حالة الزر بعد تغيير الصورة
        setInterval(() => {
            if (isButtonDisabled) {
                cancelButton.setDisabled(true);
                actionRow.components = [cancelButton];
                avatarReply.edit({ components: [actionRow] });
            }
        }, 1000);
    }
};
