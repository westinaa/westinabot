
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { permissions } = require("../../utils/permissions.js");

module.exports = {
    name: "sayaç",
    description: "Sunucu üye sayacını ayarlar",
    async execute(message, args) {
        // Yetki kontrolü
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const dataDir = path.join(__dirname, "../../data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const counterPath = path.join(dataDir, "counter.json");
        let counterData = {};

        // Mevcut ayarları kontrol et
        try {
            if (fs.existsSync(counterPath)) {
                counterData = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
            }
        } catch (error) {
            console.error("Sayaç dosyası okuma hatası:", error);
        }

        // Belirli bir sunucu için sayaç verilerini al veya yeni oluştur
        const guildCounter = counterData[message.guild.id] || { enabled: false, target: 0, channelId: null };

        // Alt komutları işle
        const subCommand = args[0]?.toLowerCase();

        if (!subCommand || subCommand === "yardım") {
            const helpEmbed = new EmbedBuilder()
                .setColor("#3498db")
                .setTitle("📊 Sayaç Sistemi Komutları")
                .setDescription("Sayaç sistemi için kullanılabilecek komutlar:")
                .addFields(
                    { name: "`.sayaç aç #kanal [hedef]`", value: "Sayacı belirtilen kanalda ve hedefle açar", inline: false },
                    { name: "`.sayaç kapat`", value: "Sayaç sistemini kapatır", inline: false },
                    { name: "`.sayaç durum`", value: "Mevcut sayaç ayarlarını gösterir", inline: false },
                    { name: "`.sayaç hedef [sayı]`", value: "Hedef üye sayısını günceller", inline: false },
                )
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [helpEmbed] });
        }

        // Sayaç Açma
        else if (subCommand === "aç") {
            const channel = message.mentions.channels.first();
            if (!channel) {
                return message.reply("❌ Lütfen bir kanal etiketleyin! Örnek: `.sayaç aç #kanal 100`");
            }

            const target = parseInt(args[2]) || message.guild.memberCount + 50;
            
            // Sayaç verilerini güncelle
            guildCounter.enabled = true;
            guildCounter.channelId = channel.id;
            guildCounter.target = target;
            
            counterData[message.guild.id] = guildCounter;
            
            fs.writeFileSync(counterPath, JSON.stringify(counterData, null, 4));
            
            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("📊 Sayaç Sistemi Aktifleştirildi")
                .setDescription(`Sayaç başarıyla ${channel} kanalına ayarlandı.`)
                .addFields(
                    { name: "🎯 Hedef", value: `${target} üye`, inline: true },
                    { name: "👥 Mevcut", value: `${message.guild.memberCount} üye`, inline: true },
                    { name: "📈 Kalan", value: `${target - message.guild.memberCount} üye`, inline: true }
                )
                .setFooter({ text: message.guild.name });
            
            return message.reply({ embeds: [successEmbed] });
        }

        // Sayaç Kapatma
        else if (subCommand === "kapat") {
            guildCounter.enabled = false;
            counterData[message.guild.id] = guildCounter;
            
            fs.writeFileSync(counterPath, JSON.stringify(counterData, null, 4));
            
            const disabledEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("📊 Sayaç Sistemi Devre Dışı")
                .setDescription("Sayaç sistemi başarıyla devre dışı bırakıldı.")
                .setFooter({ text: message.guild.name });
            
            return message.reply({ embeds: [disabledEmbed] });
        }

        // Sayaç Durumu
        else if (subCommand === "durum") {
            if (!guildCounter.enabled) {
                return message.reply("❌ Sayaç sistemi şu anda kapalı! Açmak için `.sayaç aç #kanal 100` komutunu kullanabilirsiniz.");
            }
            
            const channel = message.guild.channels.cache.get(guildCounter.channelId);
            
            const statusEmbed = new EmbedBuilder()
                .setColor("#3498db")
                .setTitle("📊 Sayaç Sistemi Bilgileri")
                .setDescription("Sayaç sistemi şu anda aktif!")
                .addFields(
                    { name: "📣 Kanal", value: channel ? `${channel}` : "Kanal bulunamadı!", inline: true },
                    { name: "🎯 Hedef", value: `${guildCounter.target} üye`, inline: true },
                    { name: "👥 Mevcut", value: `${message.guild.memberCount} üye`, inline: true },
                    { name: "📈 Kalan", value: `${guildCounter.target - message.guild.memberCount} üye`, inline: true }
                )
                .setFooter({ text: message.guild.name });
            
            return message.reply({ embeds: [statusEmbed] });
        }

        // Hedef Güncelleme
        else if (subCommand === "hedef") {
            const target = parseInt(args[1]);
            if (!target || isNaN(target) || target < 0) {
                return message.reply("❌ Lütfen geçerli bir hedef üye sayısı belirtin! Örnek: `.sayaç hedef 100`");
            }
            
            guildCounter.target = target;
            counterData[message.guild.id] = guildCounter;
            
            fs.writeFileSync(counterPath, JSON.stringify(counterData, null, 4));
            
            const targetEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("📊 Sayaç Hedefi Güncellendi")
                .setDescription(`Sayaç hedefi başarıyla **${target}** olarak güncellendi.`)
                .addFields(
                    { name: "👥 Mevcut", value: `${message.guild.memberCount} üye`, inline: true },
                    { name: "📈 Kalan", value: `${target - message.guild.memberCount} üye`, inline: true }
                )
                .setFooter({ text: message.guild.name });
            
            return message.reply({ embeds: [targetEmbed] });
        }

        else {
            return message.reply("❌ Geçersiz alt komut! Yardım için `.sayaç` yazabilirsiniz.");
        }
    },
};
