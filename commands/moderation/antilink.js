
const { permissions } = require("../../utils/permissions.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../../config.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "antilink",
    description: "Discord davet linki engelleme sistemini açar veya kapatır",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!args[0] || !["aç", "kapat", "durum"].includes(args[0].toLowerCase())) {
            const helpEmbed = new EmbedBuilder()
                .setColor("#ff9900")
                .setTitle("🛡️ Antilink Sistemi")
                .setDescription("Discord davet linki engelleme sistemini yönetir.")
                .addFields(
                    { name: "Kullanım", value: 
                      "`.antilink aç` - Sistemi açar\n" +
                      "`.antilink kapat` - Sistemi kapatır\n" +
                      "`.antilink durum` - Sistemin durumunu gösterir"
                    }
                )
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [helpEmbed] });
        }

        // Settings dosyasını kontrol et veya oluştur
        const dataDir = path.join(__dirname, "../../data");
        const settingsPath = path.join(dataDir, "settings.json");
        
        // data klasörünü oluştur (yoksa)
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // settings.json dosyasını oku veya oluştur
        let settings = {};
        try {
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
            }
        } catch (error) {
            console.error("Settings dosyası okuma hatası:", error);
        }

        // Sunucu ayarlarını başlat
        if (!settings[message.guild.id]) {
            settings[message.guild.id] = {
                antiLinkEnabled: false
            };
        }

        const action = args[0].toLowerCase();
        const guildSettings = settings[message.guild.id];

        if (action === "aç") {
            guildSettings.antiLinkEnabled = true;
            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("✅ Antilink Sistemi Aktif")
                .setDescription("Discord davet linki engelleme sistemi aktifleştirildi.")
                .setFooter({ text: "made by westina <3" });
            message.reply({ embeds: [successEmbed] });
        } 
        else if (action === "kapat") {
            guildSettings.antiLinkEnabled = false;
            const successEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("❌ Antilink Sistemi Devre Dışı")
                .setDescription("Discord davet linki engelleme sistemi devre dışı bırakıldı.")
                .setFooter({ text: "made by westina <3" });
            message.reply({ embeds: [successEmbed] });
        }
        else if (action === "durum") {
            const statusEmbed = new EmbedBuilder()
                .setColor(guildSettings.antiLinkEnabled ? "#00ff00" : "#ff0000")
                .setTitle("🛡️ Antilink Sistemi Durumu")
                .setDescription(`Discord davet linki engelleme sistemi şu anda ${guildSettings.antiLinkEnabled ? "**aktif**" : "**devre dışı**"}.`)
                .setFooter({ text: "made by westina <3" });
            message.reply({ embeds: [statusEmbed] });
            // Sadece durum kontrolü yapıldığında ayarları kaydetmeye gerek yok
            return;
        }

        // Ayarları kaydet
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), "utf8");
    },
};
