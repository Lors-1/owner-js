const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const Data = require('pro.db');

module.exports = {
    name: "فواكه",
    aliases: ["فواكة"],
    description: "لعبة البحث عن الفواكه",
    run: async (client, message, args) => {
        try {
            // التحقق من إعدادات القناة
            const setChannelId = await Data.get(`chatbank_${message.guild.id}`);
            if (message.channel.id !== setChannelId) {
                console.log("Channel mismatch");
                return;
            }

            // التحقق من حالة الحظر
            const isBlocked = await Data.get(`blocked_${message.author.id}`);
            if (isBlocked) {
                console.log("User is blocked");
                return message.react("🔒");
            }

            // التحقق من وقت آخر لعبة
            const lastClaimTime = await Data.get(`fruitstime_${message.author.id}`) || 0;
            const currentTime = Date.now();
            const cooldown = 4 * 60 * 1000; // 4 دقائق بالميلي ثانية

            if (currentTime - lastClaimTime < cooldown) {
                const remainingTime = cooldown - (currentTime - lastClaimTime);
                const minutes = Math.floor(remainingTime / (1000 * 60));
                const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
                console.log(`Cooldown active: ${minutes} minutes, ${seconds} seconds remaining`);
                return message.reply(`⌛ تعال بعد \`${minutes} دقائق ${seconds} ثانية\``);
            }

            // إعداد الإيموجيات وأزرار اللعبة
            const emojis = ["🍉", "🍇", "🍊", "🍋", "🥭", "🍎", "🍏", "🥝"];
            const correctEmojiIndex = Math.floor(Math.random() * (emojis.length * 0.75)); // زيادة احتمالية الفوز
            const correctEmoji = emojis[correctEmojiIndex];

            // جلب لون الإيمبد من قاعدة البيانات
            const color = await Data.get(`bankcolor-${message.guild.id}`) || '#01b8ff'; // لون افتراضي

            // إعداد الرسالة البداية
            const initialEmbed = new MessageEmbed()
                .setColor(color)
                .setTitle('لعبة البحث عن الفواكه!')
                .setDescription('ابحث عن الفاكهة التالية عن طريق الضغط على الأزرار.')
                .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

            const initialRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('start_game')
                        .setLabel('ابدأ اللعبة')
                        .setStyle('SECONDARY')
                );

            // إرسال الرسالة الأولى
            const initialMessage = await message.reply({ embeds: [initialEmbed], components: [initialRow] });

            // التعامل مع ردود الأفعال على الزر "ابدأ اللعبة"
            const filter = i => i.customId === 'start_game' && i.user.id === message.author.id;
            const collector = initialMessage.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'start_game') {
                    // إنشاء أزرار اللعبة بلون رمادي مع نص فارغ
                    const buttons = emojis.map(emoji =>
                        new MessageButton()
                            .setCustomId(emoji)
                            .setLabel('🔒') // رمز مغلق للإشارة إلى الأزرار المخفية
                            .setStyle('SECONDARY') // لون رمادي
                    );

                    // تقسيم الأزرار إلى صفين
                    const row1 = new MessageActionRow().addComponents(buttons.slice(0, 4));
                    const row2 = new MessageActionRow().addComponents(buttons.slice(4, 8));

                    // إعداد الرسالة مع الأزرار
                    const embed = new MessageEmbed()
                        .setColor(color)
                        .setTitle('لعبة البحث عن الفواكه!')
                        .setDescription(`ابحث عن الفاكهة التالية: ${correctEmoji}`)
                        .setFooter('اضغط على أي زر للكشف عن الفواكه!')
                        .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

                    await i.update({ embeds: [embed], components: [row1, row2] });

                    // إظهار الفواكه لمدة 5 ثواني
                    setTimeout(async () => {
                        // إنشاء أزرار اللعبة بلون رمادي مع نص الفواكه
                        const allButtons = buttons.map(button =>
                            new MessageButton()
                                .setCustomId(button.customId)
                                .setLabel(button.customId) // إظهار الفواكه بدلاً من القفل
                                .setStyle('SECONDARY') // لون رمادي
                        );

                        const row1 = new MessageActionRow().addComponents(allButtons.slice(0, 4));
                        const row2 = new MessageActionRow().addComponents(allButtons.slice(4, 8));

                        // تحديث الرسالة لتظهر جميع الفواكه
                        await i.message.edit({ embeds: [embed.setDescription(`أين الفاكهة؟`)], components: [row1, row2] });

                        // التعامل مع ردود الأفعال
                        const gameFilter = i => i.user.id === message.author.id;
                        const gameCollector = i.message.createMessageComponentCollector({ filter: gameFilter, time: 60000 });

                        gameCollector.on('collect', async i => {
                            const selectedEmoji = i.customId;

                            // تحديث الأزرار حسب الخيار الذي اختاره اللاعب
                            const updatedButtons = buttons.map(button =>
                                new MessageButton()
                                    .setCustomId(button.customId)
                                    .setLabel(button.customId)
                                    .setStyle(button.customId === correctEmoji ? 'SUCCESS' : 'DANGER') // تعيين اللون بناءً على الفاكهة الصحيحة
                            );

                            const row1 = new MessageActionRow().addComponents(updatedButtons.slice(0, 4));
                            const row2 = new MessageActionRow().addComponents(updatedButtons.slice(4, 8));

                            // تحديث الرسالة بناءً على الاختيار
                            if (selectedEmoji === correctEmoji) {
                                const previousBalance = await Data.get(`money_${message.author.id}`) || 0;
                                const newBalance = previousBalance + 3000;
                                await Data.set(`money_${message.author.id}`, newBalance);
                                await i.update({ embeds: [embed.setDescription(`🎉 مبروك! فزت ب 3000! الفاكهة كانت ${correctEmoji}`)], components: [] });
                                console.log(`Player ${message.author.id} won and balance updated`);
                            } else {
                                await i.update({ embeds: [embed.setDescription(`❌ عذراً، الفاكهة الصحيحة كانت ${correctEmoji}.`)], components: [] });
                            }

                            // تحديث وقت آخر لعبة
                            await Data.set(`fruitstime_${message.author.id}`, currentTime);
                        });

                        gameCollector.on('end', collected => {
                            if (collected.size === 0) {
                                // انتهاء الوقت
                                const updatedButtons = buttons.map(button =>
                                    new MessageButton()
                                        .setCustomId(button.customId)
                                        .setLabel(button.customId)
                                        .setStyle(button.customId === correctEmoji ? 'SUCCESS' : 'DANGER')
                                );

                                const row1 = new MessageActionRow().addComponents(updatedButtons.slice(0, 4));
                                const row2 = new MessageActionRow().addComponents(updatedButtons.slice(4, 8));

                                i.message.edit({ embeds: [embed.setDescription(`⏳ انتهى الوقت! الفاكهة كانت ${correctEmoji}.`)], components: [] });
                            }
                        });
                    }, 5000); // تأخير لمدة 5 ثواني

                    // تحديث وقت آخر لعبة
                    await Data.set(`fruitstime_${message.author.id}`, currentTime);
                    console.log("Game started");
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    // انتهاء الوقت للزر "ابدأ اللعبة"
                    initialMessage.edit({ content: '⏳ انتهى وقت بدء اللعبة. حاول مرة أخرى.', components: [] });
                }
            });

        } catch (error) {
            console.error("Error in fruit game command:", error);
            message.reply("حدث خطأ غير متوقع. حاول مرة أخرى.");
        }
    }
};
