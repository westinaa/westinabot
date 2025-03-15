const fs = require("fs");
const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const config = require("../../config.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "warn",
    description: "Kullanıcıya uyarı verir",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const user = message.mentions.users.first();
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Eksik argüman!")
                .setDescription("❌ Uyarılacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

        let warnings = {};
        try {
            warnings = JSON.parse(
                fs.readFileSync("./data/warnings.json", "utf8"),
            );
        } catch (error) {
            warnings = {};
        }

        if (!warnings[message.guild.id]) {
            warnings[message.guild.id] = {};
        }

        if (!warnings[message.guild.id][user.id]) {
            warnings[message.guild.id][user.id] = [];
        }

        warnings[message.guild.id][user.id].push({
            reason,
            moderator: message.author.id,
            timestamp: Date.now(),
        });

        fs.writeFileSync(
            "./data/warnings.json",
            JSON.stringify(warnings, null, 4),
        );

        const warningCount = warnings[message.guild.id][user.id].length;
        const successEmbed = new EmbedBuilder()
            .setColor("#ffff00")
            .setTitle("⚠️ Kullanıcı Uyarıldı")
            .setDescription(`**${user.tag}** kullanıcısı uyarıldı.`)
            .addFields(
                {
                    name: "👮 Moderatör",
                    value: message.author.tag,
                    inline: true,
                },
                {
                    name: "⚡ Uyarı Sayısı",
                    value: warningCount.toString(),
                    inline: true,
                },
                { name: "📝 Sebep", value: reason },
            )
            .setTimestamp()
            .setFooter({ text: message.guild.name });

        message.reply({ embeds: [successEmbed] });
        logger.log(message.guild, "WARN", message.author, user, reason);

        if (warningCount >= config.maxWarnings) {
            try {
                await message.guild.members.cache
                    .get(user.id)
                    .kick("Maksimum uyarı sayısına ulaşıldı");
                const kickEmbed = new EmbedBuilder()
                    .setColor("#ffa500")
                    .setTitle("🚫 Otomatik Atılma")
                    .setDescription(
                        `**${user.tag}** maksimum uyarı sayısına ulaştığı için sunucudan atıldı.`,
                    )
                    .setTimestamp()
                    .setFooter({ text: message.guild.name });
                message.channel.send({ embeds: [kickEmbed] });
            } catch (error) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("❌ Kullanıcı atılırken bir hata oluştu!")
                    .setFooter({ text: message.guild.name });
                message.channel.send({ embeds: [errorEmbed] });
            }
        }
    },
};
