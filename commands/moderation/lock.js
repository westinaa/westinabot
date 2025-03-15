
const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "kilit",
    description: "Kanalı kilitler veya kilidi açar",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Komutu açma mı kapama mı olduğunu kontrol et
        const isUnlock = message.content.toLowerCase().includes("kilit-aç");

        try {
            // @everyone rolünü bul
            const everyoneRole = message.guild.roles.everyone;
            
            // Mevcut izinleri kontrol et
            const currentPermissions = message.channel.permissionOverwrites.cache.get(everyoneRole.id);
            const canSendMessages = currentPermissions ? 
                !currentPermissions.deny.has(PermissionFlagsBits.SendMessages) : 
                true;
            
            // Eğer kanal zaten kilitli/açık ise uyarı ver
            if (isUnlock && canSendMessages) {
                const warningEmbed = new EmbedBuilder()
                    .setColor("#FFA500")
                    .setDescription("⚠️ Bu kanal zaten açık!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [warningEmbed] });
            }
            
            if (!isUnlock && !canSendMessages) {
                const warningEmbed = new EmbedBuilder()
                    .setColor("#FFA500")
                    .setDescription("⚠️ Bu kanal zaten kilitli!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [warningEmbed] });
            }

            // Kanalın izinlerini güncelle
            await message.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: isUnlock,
            });

            const embed = new EmbedBuilder()
                .setColor(isUnlock ? "#00ff00" : "#ff0000")
                .setTitle(
                    isUnlock ? "🔓 Kanal Kilidi Açıldı" : "🔒 Kanal Kilitlendi",
                )
                .setDescription(
                    `${message.channel} kanalı ${isUnlock ? "için mesaj yazma izni açıldı." : "kilitlendi. Artık sadece yetkililer mesaj yazabilir."}`,
                )
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            await message.channel.send({ embeds: [embed] });
            message.react("<a:westina_onay:1349184023867691088>");

            // Log kaydı
            logger.log(
                message.guild,
                isUnlock ? "UNLOCK" : "LOCK",
                message.author,
                { tag: message.channel.name },
                isUnlock ? "Kanal kilidi açıldı" : "Kanal kilitlendi",
            );
        } catch (error) {
            console.error("Kanal kilitleme hatası:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "❌ Kanal kilit durumu değiştirilirken bir hata oluştu!",
                )
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
