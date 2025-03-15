const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");

module.exports = {
    name: "sil",
    description: "Belirtilen sayıda mesajı siler",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            return message.reply("Bu komutu kullanma yetkiniz yok!");
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 200) {
            return message.reply(
                "Lütfen 1 ile 100 arasında bir sayı belirtin!",
            );
        }

        try {
            await message.channel.bulkDelete(amount + 1);
            const reply = await message.channel.send(
                `${amount} mesaj silindi.`,
            );
            setTimeout(() => reply.delete(), 3000);
            logger.log(
                message.guild,
                "CLEAR",
                message.author,
                { tag: `${amount} mesaj` },
                "Toplu mesaj silme",
            );
        } catch (error) {
            message.reply("Mesajlar silinirken bir hata oluştu!");
        }
    },
};
