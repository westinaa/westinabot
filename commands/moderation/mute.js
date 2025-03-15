const { permissions } = require("../../utils/permissions.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require("discord.js");
const User = require("../../models/userModel.js");
const ms = require("ms"); // Süreyi işlemek için ms modülünü kullanıyoruz.

module.exports = {
    name: "mute",
    description: "Kullanıcıyı yazılı ya da sesli olarak mute eder.",
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
                .setDescription("<a:westina_red:1349419144243576974> Mute atılacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const time = args[1];
        const reason = args.slice(2).join(" ") || "Sebep belirtilmedi.";

        if (!time || isNaN(ms(time))) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Geçerli bir süre belirtmelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Butonlar ekle
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("writtenMute")
                .setLabel("Yazılı Mute")
                .setStyle("Primary"),
            new ButtonBuilder()
                .setCustomId("voiceMute")
                .setLabel("Sesli Mute")
                .setStyle("Primary")
        );

        const confirmationEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("Mute Seçeneğini Seçin")
            .setDescription("Mute türünü seçmek için butonlardan birine tıklayın.")
            .setFooter({ text: message.guild.name });

        message.reply({ embeds: [confirmationEmbed], components: [row] });

        // Butonların tıklanma olayını dinle
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: ms(time) });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "writtenMute") {
                // Yazılı mute
                const mutedRole = message.guild.roles.cache.find(role => role.name === "Muted"); // "Muted" rolünü bul
                if (!mutedRole) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setDescription("<a:westina_red:1349419144243576974> 'Muted' rolü bulunamadı!")
                        .setFooter({ text: message.guild.name });
                    return message.reply({ embeds: [errorEmbed] });
                }

                await user.roles.add(mutedRole); // "Muted" rolünü ekle

                // Metin kanallarında yazma engelle
                await user.permissions.remove(PermissionsBitField.Flags.SendMessages); // Metin kanalında yazmayı engelle

                // Yazılı mute için süreyi başlat
                setTimeout(async () => {
                    await user.roles.remove(mutedRole); // Süre dolduğunda "Muted" rolünü kaldır
                    await user.permissions.add(PermissionsBitField.Flags.SendMessages); // Yazma izni ver
                }, ms(time));

                const successEmbed = new EmbedBuilder()
                    .setColor("#98ff98")
                    .setTitle("🔇 Yazılı Mute Uygulandı")
                    .setDescription(`**${user.user.tag}** kullanıcısına yazılı mute uygulandı.`)
                    .addFields(
                        { name: "👮 Moderatör", value: message.author.tag, inline: true },
                        { name: "📝 Sebep", value: reason, inline: true },
                        { name: "⏳ Süre", value: time, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: message.guild.name });

                message.reply({ embeds: [successEmbed] });
            } else if (interaction.customId === "voiceMute") {
                // Sesli mute
                if (!user.voice.channel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setDescription("<a:westina_red:1349419144243576974> Kullanıcı sesli kanala bağlı değil!")
                        .setFooter({ text: message.guild.name });
                    return message.reply({ embeds: [errorEmbed] });
                }

                await user.voice.setMute(true, reason); // Kullanıcının sesini sustur
                setTimeout(() => {
                    user.voice.setMute(false);  // Süre dolunca sesli mute'u kaldır
                }, ms(time));

                const successEmbed = new EmbedBuilder()
                    .setColor("#98ff98")
                    .setTitle("🔇 Sesli Mute Uygulandı")
                    .setDescription(`**${user.user.tag}** kullanıcısına sesli mute uygulandı.`)
                    .addFields(
                        { name: "👮 Moderatör", value: message.author.tag, inline: true },
                        { name: "📝 Sebep", value: reason, inline: true },
                        { name: "⏳ Süre", value: time, inline: true }
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
                .setDescription("<a:westina_red:1349419144243576974> Süre doldu, mute türü seçilmedi!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [timeoutEmbed] });
        });
    },
};
