const { permissions } = require("../../utils/permissions.js");
const { EmbedBuilder } = require("discord.js");
const Ban = require("../../models/Ban");

module.exports = {
    name: "unban",
    description: "Yasaklı bir kullanıcıyı sunucudan yasaklamayı kaldırır",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcı ID veya etiketle alınabilir
        const userId = args[0];
        if (!userId) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Eksik argüman!")
                .setDescription("❌ Yasaklanan kullanıcının ID'sini girmelisiniz ya da etiketlemelisiniz!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Eğer kullanıcı etiketlenmişse ID'sini alalım
        let user;
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else {
            user = await message.guild.members.fetch(userId).catch(() => null);
        }

        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Geçersiz kullanıcı!")
                .setDescription("❌ Bu ID veya etiket ile bir kullanıcı bulunamadı!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Yasaklı kullanıcıyı unban yap
            await message.guild.members.unban(user.id);

            // MongoDB'den ban kaydını sil
            await Ban.findOneAndDelete({ userId: user.id, guildId: message.guild.id });

            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("✅ Kullanıcı Yasaklaması Kaldırıldı")
                .setDescription(`**${user.tag}** kullanıcısının yasaklaması kaldırıldı.`)
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Kullanıcı yasaklaması kaldırılırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
