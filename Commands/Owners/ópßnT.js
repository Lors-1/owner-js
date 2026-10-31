const Data = require('pro.db');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "تعطيل",
    description: "تعطيل عرض أوامر البنك في القناة المحددة",
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('');

        await Data.delete(`chatbank_${message.guild.id}`);
        message.react("☑️");
    }
};
