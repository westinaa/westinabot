
const config = require('../config.js');
const { permissions } = require('./permissions.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// URL ve Discord davet linki regex'leri
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const DISCORD_INVITE_REGEX = /(discord\.gg|discord\.com\/invite)\/.+/i;

module.exports = {
    async checkMessage(message) {
        // Moderatörler muaf
        if (permissions.checkModerator(message.member)) {
            return false;
        }

        // Data dizinini kontrol et ve oluştur
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Ayarları kontrol et
        const settingsPath = path.join(dataDir, 'settings.json');
        let settings = {};
        
        try {
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            }
        } catch (error) {
            console.error('Settings dosyası okuma hatası:', error);
            return false;
        }

        // Sunucu ayarı yoksa veya antiLink sistemi kapalıysa
        if (!settings[message.guild.id] || !settings[message.guild.id].antiLinkEnabled) {
            return false;
        }

        const content = message.content.toLowerCase();

        // Discord davet linki içeren mesajları kontrol et
        if (DISCORD_INVITE_REGEX.test(content)) {
            try {
                // Mesajı sil
                await message.delete();

                // Kullanıcının uyarı sayısını kontrol et veya oluştur
                const warningsPath = path.join(__dirname, '../data/link_warnings.json');
                let warnings = {};
                
                try {
                    if (fs.existsSync(warningsPath)) {
                        warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
                    } else {
                        // Dosya yoksa boş bir dosya oluştur
                        fs.writeFileSync(warningsPath, JSON.stringify({}, null, 4), 'utf8');
                    }
                } catch (error) {
                    console.error('Uyarı dosyası okuma hatası:', error);
                }

                // Sunucu ve kullanıcı için uyarı kaydı oluştur
                if (!warnings[message.guild.id]) {
                    warnings[message.guild.id] = {};
                }
                
                if (!warnings[message.guild.id][message.author.id]) {
                    warnings[message.guild.id][message.author.id] = {
                        count: 0,
                        lastWarning: 0
                    };
                }

                const userWarnings = warnings[message.guild.id][message.author.id];
                const now = Date.now();
                
                // Son uyarıdan 30 dakika geçtiyse uyarı sayısını sıfırla
                if (now - userWarnings.lastWarning > 30 * 60 * 1000) {
                    userWarnings.count = 0;
                }
                
                userWarnings.count++;
                userWarnings.lastWarning = now;
                
                // Uyarıları kaydet
                fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 4), 'utf8');

                // Uyarı mesajı gönder
                const warningEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⚠️ Discord Davet Linki Tespit Edildi')
                    .setDescription(`${message.author}, discord davet linki paylaşmak yasaktır! Bu bir uyarıdır.`)
                    .setFooter({ text: `Uyarı: ${userWarnings.count}/3` });

                const reply = await message.channel.send({ embeds: [warningEmbed] });
                setTimeout(() => reply.delete().catch(e => console.error('Mesaj silme hatası:', e)), 5000);

                // 3 uyarıdan sonra mute uygula
                if (userWarnings.count >= 3) {
                    // Mute rolünü bul veya oluştur
                    let muteRole = message.guild.roles.cache.find(role => role.name === config.muteRoleName);
                    if (!muteRole) {
                        muteRole = await message.guild.roles.create({
                            name: config.muteRoleName,
                            color: '#808080',
                            reason: 'Susturulmuş kullanıcılar için rol'
                        });

                        // Tüm kanallarda mute rolü için izinleri ayarla
                        message.guild.channels.cache.forEach(async channel => {
                            if (channel.type === 0) { // Text kanalı
                                await channel.permissionOverwrites.create(muteRole, {
                                    SendMessages: false,
                                    AddReactions: false
                                });
                            }
                        });
                    }

                    // Kullanıcıya mute rolü ver
                    await message.member.roles.add(muteRole);

                    // Kullanıcıya bildirim gönder
                    const muteEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🔇 Kullanıcı Susturuldu')
                        .setDescription(`${message.author.tag}, discord davet linki paylaştığınız için 15 dakika susturuldunuz!`)
                        .setFooter({ text: message.guild.name });

                    const muteReply = await message.channel.send({ embeds: [muteEmbed] });
                    setTimeout(() => muteReply.delete().catch(e => console.error('Mesaj silme hatası:', e)), 5000);

                    // Uyarı sayısını sıfırla
                    userWarnings.count = 0;
                    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 4), 'utf8');

                    // 15 dakika sonra mute'ı kaldır
                    setTimeout(async () => {
                        try {
                            if (message.member.roles.cache.has(muteRole.id)) {
                                await message.member.roles.remove(muteRole);
                                const unmuteEmbed = new EmbedBuilder()
                                    .setColor('#00ffff')
                                    .setTitle('🔊 Susturma Kaldırıldı')
                                    .setDescription(`${message.author.tag} kullanıcısının susturulması sona erdi.`)
                                    .setTimestamp()
                                    .setFooter({ text: message.guild.name });

                                message.channel.send({ embeds: [unmuteEmbed] });
                            }
                        } catch (error) {
                            console.error('Mute kaldırma hatası:', error);
                        }
                    }, 15 * 60 * 1000); // 15 dakika = 15 * 60 * 1000 ms
                }

                return {
                    type: 'invite',
                    content: message.content,
                    action: userWarnings.count >= 3 ? 'mute' : 'warn'
                };
            } catch (error) {
                console.error('Antilink işleme hatası:', error);
                console.error('Hata oluşan mesaj içeriği:', content);
            }
        }

        return false;
    }
};

// Mesajın içinde davet linki olup olmadığını kontrol eder
function isJustInviteLink(content) {
    // Boşlukları temizle
    const trimmedContent = content.trim();
    
    // Davet linki regex'i ile eşleşiyor mu?
    return DISCORD_INVITE_REGEX.test(trimmedContent);
}
