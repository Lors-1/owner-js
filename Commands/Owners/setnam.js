const { MessageButton, MessageActionRow } = require('discord.js');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "setname",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('');

        // إنشاء رسالة الرد الأصلية
        const nameReply = await message.channel.send(`<@${message.author.id}> - يرجى إرفاق الاسم الجديد للبوت، ملاحظة: يجب أن يكون الاسم مكتوبًا كنص`);

        // إنشاء زر الإلغاء
        const cancelButton = new MessageButton()
            .setCustomId('cancelNameChange')
            .setLabel('الغاء')
            .setStyle('DANGER');

        // إنشاء صف الأزرار
        const actionRow = new MessageActionRow().addComponents(cancelButton);

        // تحديث رسالة الرد مع الزر
        await nameReply.edit({ content: `<@${message.author.id}> - يرجى إرفاق الاسم الجديد للبوت، ملاحظة: يجب أن يكون الاسم مكتوبًا كنص`, components: [actionRow] });

        // تعيين متغير لحالة الزر
        let isButtonDisabled = false;

        const filter = (msg) => msg.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 }); // مدة الانتظار 60 ثانية

        collector.on('collect', async (msg) => {
            const newName = msg.content;
            try {
                await client.user.setUsername(newName);
                await nameReply.edit(`**تم تغيير اسم البوت إلى ${newName} بنجاح.** ☑️`);
                msg.delete()
                isButtonDisabled = true;
            } catch (error) {
                console.error(error);
                await nameReply.edit("**يرجى محاولة تغير إسم البوت بوقت آخر. ❌**");
            }
            collector.stop(); 
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                nameReply.edit("**لم يتم إرسال اسم جديد في الوقت المناسب.** ⌛");
            }
        });

        // إضافة معالج لزر الإلغاء
        const buttonCollector = message.channel.createMessageComponentCollector({ time: 60000 });
        buttonCollector.on('collect', async interaction => {
            if (interaction.customId === 'cancelNameChange') {
                await nameReply.edit("**تم الغاء تغيير اسم البوت.** ❌");
                collector.stop();
                buttonCollector.stop();
            }
        });

        buttonCollector.on('end', () => {
            if (!nameReply.deleted) {
                nameReply.delete().catch(console.error);
            }
        });

        // تحديث حالة الزر بعد تغيير الاسم
        setInterval(() => {
            if (isButtonDisabled) {
                cancelButton.setDisabled(true);
                actionRow.components = [cancelButton];
                nameReply.edit({ components: [actionRow] });
            }
        }, 1000);
    }
};
