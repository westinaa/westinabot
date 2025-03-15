// commands/moderation/sicil.js
const penaltyManager = require("../../utils/penaltyManager.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "sicil",
    description: "Kullanıcının ceza geçmişini gösterir",
    async execute(message, args) {
        const user = message.mentions.members.first();
        if (!user) {
            return message.reply(
                "❌ Geçmişini görmek istediğiniz kullanıcıyı etiketlemelisiniz!",
            );
        }

        const penalties = penaltyManager.getPenalties(user.id);
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle(`${user.user.tag} - Ceza Geçmişi`)
            .setDescription(
                penalties.length > 0 ? "" : "Bu kullanıcının ceza geçmişi yok.",
            );

        penalties.forEach((penalty) => {
            embed.addFields(
                { name: "Ceza Türü", value: penalty.type, inline: true },
                {
                    name: "Uygulayan Moderatör",
                    value: penalty.moderator,
                    inline: true,
                },
                {
                    name: "Ceza Tarihi",
                    value: penalty.date.toLocaleString(),
                    inline: true,
                },
            );
        });

        await message.channel.send({ embeds: [embed] });
    },
};
