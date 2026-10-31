const Data = require('pro.db');
const { Permissions } = require('discord.js');

module.exports = {
    name: "setlog",
    description: "تعيين قناة اللوج",
    run: async (client, message, args) => {
        if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return message.reply("ليس لديك صلاحيات.");
        }

        // تحديد القناة المطلوبة
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
        
        // تحقق من أن القناة موجودة
        if (!channel) return message.reply("يرجى تحديد شات صالح .");

        let logChannel = await Data.get(`logChannel_${message.guild.id}`);

        if (logChannel && channel.id === logChannel) {
            // إذا كانت القناة الحالية هي قناة اللوج بالفعل
            await Data.delete(`logChannel_${message.guild.id}`);
            message.react("🗑");
            message.reply({
                allowedMentions: { repliedUser: false },
            });
            client.emit("log", message.guild, {
                author: message.author,
                date: new Date(),
                value: "حذف قناة اللوج",
            });
            return;
        }

        // تعيين قناة اللوج الجديدة
        await Data.set(`logChannel_${message.guild.id}`, channel.id);
        message.react("✅");
        message.reply({
            allowedMentions: { repliedUser: false },
        });
        client.emit("log", message.guild, {
            author: message.author,
            date: new Date(),
            value: "تعيين قناة اللوج",
        });
    }
};
