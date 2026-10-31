const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const Data = require('pro.db');
const products = require('./products');  // استيراد المنتجات من الملف المركزي

let activeMenus = {};

module.exports = {
  name: "شراء",
  description: "شراء منتج من المتجر",
  run: async (client, message, args) => {
    const userId = message.author.id;

    const setchannel = await Data.get(`chatbank_${message.guild.id}`);
    if (message.channel.id !== setchannel) return message.reply("**هذا الأمر لا يمكن استخدامه في هذه الشات**");

    if (activeMenus[userId]) {
      return message.reply("**قم باكمال الشراء السابق**");
    }

    if (args.length < 1) {
      return message.reply("**يرجى إدخال الكمية التي ترغب في شرائها**");
    }

    const quantity = parseInt(args[0]);
    if (isNaN(quantity) || quantity <= 0 || quantity > 2) {
      return message.reply("يرجى إدخال عدد صحيح للكمية (1 أو 2 فقط).");
    }

    const colors = await Data.get(`bankcolor-${message.guild.id}`) || "#01b8ff"; // لون افتراضي

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('product_select')
          .setPlaceholder('اختر منتجاً للشراء')
          .addOptions(products.map((product, index) => ({
            label: `${product.emoji} ${product.name}`,
            description: `السعر: ${product.price}$`,
            value: `product_${index}`,
          })))
      );

    const embed = new MessageEmbed()
      .setTitle("🛒 قائمة المنتجات")
      .setDescription("اختر المنتج الذي ترغب في شرائه من القائمة أدناه")
      .setColor(colors)
      .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

    const messageEmbed = await message.reply({ embeds: [embed], components: [row] });

    activeMenus[userId] = true;

    const filter = interaction => interaction.customId === 'product_select' && interaction.user.id === userId;

    messageEmbed.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 30000 })
      .then(async interaction => {
        const selectedIndex = parseInt(interaction.values[0].split('_')[1]);
        const product = products[selectedIndex];
        const totalCost = product.price * quantity;

        const userBalance = await Data.get(`money_${userId}`) || 0;

        if (userBalance < totalCost) {
          activeMenus[userId] = false;
          return interaction.update({ content: `**رصيدك غير كافٍ. تحتاج إلى ${totalCost - userBalance}$ إضافية**`, embeds: [], components: [] });
        }

        const ownedQuantity = await Data.get(`owned_${userId}_${product.name}`) || 0;
        if (ownedQuantity > 0) {
          activeMenus[userId] = false;
          return interaction.update({ content: `**لديك بالفعل ${ownedQuantity} من ${product.emoji} **${product.name}**، لا يمكنك شراء المزيد**`, embeds: [], components: [] });
        }

        await Data.subtract(`money_${userId}`, totalCost);
        await Data.set(`owned_${userId}_${product.name}`, ownedQuantity + quantity);

        const confirmationEmbed = new MessageEmbed()
          .setTitle("💸 تم الشراء")
          .setDescription(`لقد اشتريت ${quantity} من ${product.emoji} **${product.name}** بمبلغ **${totalCost}$**.`)
          .setColor(colors)
          .setFooter({ text: 'FlatStore', iconURL: 'https://media.discordapp.net/attachments/1443594740468809810/1451217692013887488/logo.png?ex=69455f4c&is=69440dcc&hm=31402dea3d1f776006e1133d69e21c04879029f5c9dfdf167a75aa91d9928bf6&format=webp&quality=lossless&width=960&height=960&' });

        await interaction.update({ embeds: [confirmationEmbed], components: [] });
        activeMenus[userId] = false;
      })
      .catch(() => {
        message.reply("انتهى الوقت، يرجى إعادة المحاولة.");
        activeMenus[userId] = false;
      });
  }
};
