
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    // Kullanıcı girişinde sayaç mesajı gönder
    async handleJoin(member) {
        const counterData = this.getCounterData();
        const guildCounter = counterData[member.guild.id];

        // Sayaç aktif değilse işlem yapma
        if (!guildCounter || !guildCounter.enabled) return;

        const channel = member.guild.channels.cache.get(guildCounter.channelId);
        if (!channel) return;

        const remaining = guildCounter.target - member.guild.memberCount;
        const isReached = remaining <= 0;

        const embedColor = isReached ? "#00ff00" : "#3498db";
        
        // Davet eden kişiyi bulmaya çalış
        let inviter = "Bilinmiyor";
        try {
            // Son 1000 daveti çek (Discord API limiti)
            const guildInvites = await member.guild.invites.fetch();
            
            // Davet kodunu bulmaya çalış
            guildInvites.forEach(invite => {
                if (invite.uses > 0) {
                    // Kullanılan bir davet bulundu
                    inviter = invite.inviter ? invite.inviter.tag : "Bilinmiyor";
                }
            });
        } catch (error) {
            console.error("Davet bilgisi alınırken hata:", error);
        }
        
        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("📥 Yeni Üye Katıldı")
            .setDescription(`${member} sunucuya katıldı!`)
            .addFields(
                { name: "👥 Üye Sayısı", value: `${member.guild.memberCount}/${guildCounter.target} üye`, inline: true },
                { 
                    name: isReached ? "🎉 Hedef Durumu" : "🎯 Hedefe Kalan", 
                    value: isReached ? "Hedef başarıyla tamamlandı!" : `${remaining} üye kaldı`, 
                    inline: true 
                },
                { name: "📨 Davet Eden", value: inviter, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: member.guild.name });

        channel.send({ embeds: [embed] });

        // Hedef ulaşıldığında özel mesaj
        if (isReached) {
            const celebrationEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("🎉 Hedef Başarıyla Tamamlandı!")
                .setDescription(`Hedeflenen **${guildCounter.target}** üye sayısına ulaşıldı.`)
                .setTimestamp()
                .setFooter({ text: member.guild.name });

            channel.send({ embeds: [celebrationEmbed] });
        }
    },

    // Kullanıcı çıkışında sayaç mesajı gönder
    async handleLeave(member) {
        const counterData = this.getCounterData();
        const guildCounter = counterData[member.guild.id];

        // Sayaç aktif değilse işlem yapma
        if (!guildCounter || !guildCounter.enabled) return;

        const channel = member.guild.channels.cache.get(guildCounter.channelId);
        if (!channel) return;

        const remaining = guildCounter.target - (member.guild.memberCount - 1); // -1 çünkü üye henüz sunucudan ayrılmamış olabilir

        const embed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("📤 Üye Ayrıldı")
            .setDescription(`${member.user.tag} sunucudan ayrıldı!`)
            .addFields(
                { name: "👥 Üye Sayısı", value: `${member.guild.memberCount - 1}/${guildCounter.target} üye`, inline: true },
                { name: "🎯 Hedefe Kalan", value: `${remaining} üye`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: member.guild.name });

        channel.send({ embeds: [embed] });
    },

    // Sayaç verilerini oku
    getCounterData() {
        const dataDir = path.join(__dirname, "../data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const counterPath = path.join(dataDir, "counter.json");
        
        try {
            if (fs.existsSync(counterPath)) {
                return JSON.parse(fs.readFileSync(counterPath, 'utf8'));
            }
        } catch (error) {
            console.error("Sayaç dosyası okuma hatası:", error);
        }
        
        return {};
    }
};
