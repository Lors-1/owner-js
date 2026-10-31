const Data = require('pro.db');
const fs = require('fs');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: "rest",
    run: async (client, message, args) => {
      if (!owners.includes(message.author.id)) return message.react('');

        const filePath = './database.json';
        fs.writeFile(filePath, '{}', (err) => {
          if (err) {
            console.error('حدث خطأ أثناء حذف البيانات:', err);
            return message.reply('\`\`\`.حدث خطأ، يرجى تحديد شخص صحيح\`\`\`');
          }
          message.reply('**تم إعادة تعين البوت بنجاح.** ☑️');
        });
    }
};
