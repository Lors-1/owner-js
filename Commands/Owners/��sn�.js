const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Data = require('pro.db');
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "تطفير",
    description: "تصفير جميع حسابات البنك",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        fs.readFile('database.json', 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return message.reply("حدث خطأ أثناء قراءة قاعدة البيانات.");
            }

            const database = JSON.parse(data);
            const keysToReset = ["money_", "marriage_", "protectionHours_", "totalLoot_" ,"owned_" ];
            const usersWithBalance = Object.keys(database)
                .filter(key => keysToReset.some(prefix => key.startsWith(prefix)) && database[key] > 0);
            
            usersWithBalance.forEach(userId => {
                keysToReset.forEach(prefix => {
                    const key = userId.replace(/(money_|marriage_|protectionHours_|totalLoot_|owned_)/, prefix);
                    if (database[key] !== undefined) {
                        database[key] = 0; // Reset the value to 0
                    }
                });
            });

            fs.writeFile('database.json', JSON.stringify(database, null, 2), 'utf8', async (err) => {
                if (err) {
                    console.error(err);
                    return message.reply("حدث خطأ أثناء كتابة قاعدة البيانات.");
                }

                message.reply("تم تصفير جميع الحسابات.");
                message.react("☑️");

                // تسجيل اللوج
                const logChannelId = await Data.get(`logChannel_${message.guild.id}`);
                const logChannel = message.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new MessageEmbed()
                        .setTitle("تطفير الحسابات")
                        .setDescription(`**تم تصفير جميع الحسابات في البنك من قبل <@${message.author.id}>**`)
                        .addField("الاداري", `<@${message.author.id}>`)
                        .setThumbnail('https://e.top4top.io/p_31278dayn1.png')
                        .setColor("#01b8ff")
                        .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1434615693298499845/1444304998220431484/logo.png?ex=69449d19&is=69434b99&hm=d975f502c60a1b6746cfefcc9398ff1c3d75da1090166b7ae0040c2b84abfbf7&=&format=webp&quality=lossless&width=856&height=856' });
                
                    logChannel.send({ embeds: [logEmbed] });
                }                
            });
        });
    }
};
