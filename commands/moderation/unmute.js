const { permissions } = require("../../utils/permissions.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const User = require("../../models/userModel.js");

module.exports = {
    name: "unmute",
    description: "Kullanıcıyı mute durumundan çıkarır.",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Unmute edilecek kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

        // Unmute butonları oluştur
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("writtenUnmute")
                .setLabel("Yazılı Unmute")
                .setStyle("PRIMARY"),
            new ButtonBuilder()
                .setCustomId("voiceUnmute")
                .setLabel("Sesli Unmute")
                .setStyle("PRIMARY")
        );

        const confirmationEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("Unmute Seçeneğini Seçin")
            .setDescription("Unmute türünü seçmek için butonlardan birine tıklayın.")
            .setFooter({ text: message.guild.name });

        message.reply({ embeds: [confirmationEmbed], components: [row] });

        // Butonların tıklanma olayını dinle
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "writtenUnmute") {
                // Yazılı unmute
                const mutedRole = message.guild.roles.cache.find(role => role.name === "Muted"); // "Muted" rolünü bul

                if (user.roles.cache.has(mutedRole.id)) {
                    await user.roles.remove(mutedRole); // "Muted" rolünü kaldır
                }

                // Kullanıcının mute bilgisini veritabanından sil
                const existingUser = await User.findOne({ userId: user.id });
                if (existingUser) {
                    existingUser.mutes = existingUser.mutes.filter(mute => mute.muteEndTime === null); // Süresiz mute'leri kaldır
                    await existingUser.save();
                }

                const successEmbed = new EmbedBuilder()
                    .setColor("#98ff98")
                    .setTitle("🔊 Yazılı Unmute Uygulandı")
                    .setDescription(`**${user.user.tag}** kullanıcısının yazılı mute'u kaldırıldı.`)
                    .addFields(
                        { name: "👮 Moderatör", value: message.author.tag, inline: true },
                        { name: "📝 Sebep", value: reason }
                    )
                    .setTimestamp()
                    .setFooter({ text: message.guild.name });

                message.reply({ embeds: [successEmbed] });
            } else if (interaction.customId === "voiceUnmute") {
                // Sesli unmute
                await user.voice.setMute(false); // Kullanıcının mikrofonunu aç

                // Kullanıcının mute bilgisini veritabanından sil
                const existingUser = await User.findOne({ userId: user.id });
                if (existingUser) {
                    existingUser.mutes = existingUser.mutes.filter(mute => mute.muteEndTime === null); // Süresiz mute'leri kaldır
                    await existingUser.save();
                }

                const successEmbed = new EmbedBuilder()
                    .setColor("#98ff98")
                    .setTitle("🔊 Sesli Unmute Uygulandı")
                    .setDescription(`**${user.user.tag}** kullanıcısının sesli mute'u kaldırıldı.`)
                    .addFields(
                        { name: "👮 Moderatör", value: message.author.tag, inline: true },
                        { name: "📝 Sebep", value: reason }
                    )
                    .setTimestamp()
                    .setFooter({ text: message.guild.name });

                message.reply({ embeds: [successEmbed] });
            }

            // Etkileşimi kapat
            interaction.deferUpdate();
        });

        collector.on("end", () => {
            const timeoutEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Süre doldu, unmute türü seçilmedi!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [timeoutEmbed] });
        });
    },
};
