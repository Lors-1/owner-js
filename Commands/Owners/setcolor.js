const Data = require('pro.db');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "setcolor",
    description: "يعين كود لون جديد للبنك.",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('');

        const newColor = args[0];
        if (!newColor) return message.reply("**يرجى إرفاق كود اللون الجديد.**");

        // التحقق من أن اللون المقدم هو كود لون صحيح
        const colorRegex = /^#([0-9A-F]{3}){1,2}$/i;
        if (!colorRegex.test(newColor)) {
            return message.reply("**يرجى تقديم كود لون صحيح بصيغة مثل #749590**");
        }

        await Data.set(`bankcolor-${message.guild.id}`, newColor);
        message.react("☑️");
    }
};
