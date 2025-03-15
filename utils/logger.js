const Discord = require('discord.js');
const config = require('../config.js');

const COLORS = {
    BAN: '#ff0000',      // Kırmızı
    UNBAN: '#00ff00',    // Yeşil
    KICK: '#ffa500',     // Turuncu
    WARN: '#ffff00',     // Sarı
    MUTE: '#800080',     // Mor
    UNMUTE: '#00ffff',   // Açık Mavi
    CLEAR: '#808080',    // Gri
    'ROL-VERME': '#0000ff', // Mavi
    'ROL-ALMA': '#4b0082',  // Indigo
    JAIL: '#1e1e1e',     // Koyu Gri
    UNJAIL: '#98ff98',   // Açık Yeşil
    'ROLE-CREATE': '#32cd32', // Lime Yeşil
    'ROLE-DELETE': '#dc143c', // Koyu Kırmızı
    'ROLE-UPDATE': '#daa520',  // Altın Sarısı
    'CHANNEL-CREATE': '#20b2aa', // Açık Deniz Yeşili
    'CHANNEL-DELETE': '#8b0000', // Koyu Kırmızı
    'CHANNEL-UPDATE': '#f0e68c',  // Khaki
    LOCK: '#dc143c',     // Koyu Kırmızı
    UNLOCK: '#32cd32'    // Lime Yeşil
};

module.exports = {
    async log(guild, action, moderator, target, reason) {
        const logChannel = guild.channels.cache.find(channel => channel.name === config.logChannelName);
        if (!logChannel) return;

        const embed = new Discord.EmbedBuilder()
            .setColor(COLORS[action] || '#ff0000')
            .setTitle('📋 Moderasyon Logu')
            .setDescription(`**${action}** işlemi gerçekleştirildi`)
            .addFields(
                { name: '👮 Moderatör', value: moderator.tag, inline: true },
                { name: '👤 Kullanıcı', value: target.tag, inline: true },
                { name: '📝 Sebep', value: reason }
            )
            .setTimestamp()
            .setFooter({ text: `${guild.name} Moderasyon Sistemi` });

        await logChannel.send({ embeds: [embed] });
    }
};