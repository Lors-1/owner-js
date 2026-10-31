const { MessageEmbed } = require('discord.js');
const { prefix, owners, serverInvite } = require(`${process.cwd()}/config`);
const Data = require('pro.db');

module.exports = {
    name: 'help',
    aliases: ["اوامر"],
    run: async (client, message, args) => {
        const overlayColor = Data.get(`bankcolor-${message.guild.id}`);
        let setchannel = Data.get(`chatbank_${message.guild.id}`);
        
        if (message.channel.id !== setchannel) return;

        const isBlocked = await Data.get(`blocked_${message.author.id}`);
        if (isBlocked) return message.react("🔒");

        const helpEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setTitle("**مرحبًا بك في اوامر اللعب**") // عنوان واضح
            .setColor(overlayColor)
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() }); // إضافة اسم السيرفر وصورته

        // تقسيم الأوامر إلى مجموعات
        helpEmbed.addFields(
            { name: ' أوامر البنك', value: '`راتب` | `حظ` | `بخشيش` |`استثمار` | `تداول`', inline: true },
            { name: ' أوامر القمار', value: '`قمار`| `نرد` | `رهان `', inline: true },
            { name: ' أوامر الحرامية', value: '`نهب` | `حراميه`', inline: true },
            { name: ' أوامر المعاملات', value: '`فلوس` | `قرض` | `سداد` | `توب`', inline: true },
            { name: ' أوامر الزواج', value: '`زواجي` | `زواجات` | `طلاق`| `زواج` | `طلاق` |`خلع`', inline: true },
            { name: ' أوامر المتجر', value: '`متجر` | `المبيعات` | `بيع` | `شراء` | `ممتلكات` |', inline: false },
            { name: ' أوامر اخرى', value: ' `تبرع` | `تحويل` | `فواكه` | `لعبه` | `وقت`' , inline: false }
        );

        message.reply({ embeds: [helpEmbed] });
    }
};
