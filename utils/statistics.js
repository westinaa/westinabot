const { Collection } = require('discord.js');

// Kullanıcı aktivitelerini takip etmek için koleksiyonlar
const messageStats = new Collection();
const voiceStats = new Collection();
const lastActive = new Collection();
const channelStats = new Collection();

module.exports = {
    // Mesaj istatistiklerini güncelle
    updateMessageStats(userId, guildId, channelId) {
        const key = `${guildId}-${userId}`;
        const timestamp = Date.now();

        // Genel mesaj istatistikleri
        const current = messageStats.get(key) || [];
        current.push(timestamp);
        messageStats.set(key, current);

        // Kanal bazlı istatistikler
        const channelKey = `${key}-${channelId}`;
        const channelData = channelStats.get(channelKey) || [];
        channelData.push(timestamp);
        channelStats.set(channelKey, channelData);

        lastActive.set(userId, timestamp);
    },

    // Ses istatistiklerini güncelle (dakika cinsinden)
    updateVoiceStats(userId, guildId, channelId, duration) {
        const key = `${guildId}-${userId}`;
        const timestamp = Date.now();

        // Genel ses istatistikleri
        const current = voiceStats.get(key) || [];
        current.push({
            timestamp,
            duration,
            channelId
        });
        voiceStats.set(key, current);

        lastActive.set(userId, timestamp);
    },

    // Belirli bir zaman aralığındaki kullanıcı istatistiklerini al
    getUserStats(userId, guildId, days = null) {
        const key = `${guildId}-${userId}`;
        const cutoffTime = days ? Date.now() - (days * 24 * 60 * 60 * 1000) : 0;

        const messages = messageStats.get(key) || [];
        const recentMessages = messages.filter(timestamp => timestamp > cutoffTime).length;

        const voiceLogs = voiceStats.get(key) || [];
        const recentVoice = voiceLogs
            .filter(log => log.timestamp > cutoffTime)
            .reduce((total, log) => total + log.duration, 0);

        return {
            messages: recentMessages,
            voiceMinutes: recentVoice,
            lastActive: lastActive.get(userId) || null,
            periodDays: days || 'tüm zamanlar'
        };
    },

    // Kullanıcının detaylı aktivite bilgilerini al
    async getDetailedActivity(userId, guildId, guild, days = 7) {
        const key = `${guildId}-${userId}`;
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

        // Kanal bazlı mesaj istatistikleri
        const channelActivity = new Map();
        for (const [channelKey, timestamps] of channelStats) {
            if (channelKey.startsWith(key)) {
                const channelId = channelKey.split('-')[2];
                const channel = guild.channels.cache.get(channelId);
                if (channel) {
                    const recentMessages = timestamps.filter(t => t > cutoffTime).length;
                    if (recentMessages > 0) {
                        channelActivity.set(channel.name, recentMessages);
                    }
                }
            }
        }

        // Ses aktivitesi
        const voiceLogs = voiceStats.get(key) || [];
        const voiceChannels = new Map();
        for (const log of voiceLogs.filter(l => l.timestamp > cutoffTime)) {
            const channel = guild.channels.cache.get(log.channelId);
            if (channel) {
                voiceChannels.set(channel.name, (voiceChannels.get(channel.name) || 0) + log.duration);
            }
        }

        return {
            channelActivity: Object.fromEntries(channelActivity),
            voiceChannels: Object.fromEntries(voiceChannels),
            totalMessages: messageStats.get(key)?.filter(t => t > cutoffTime).length || 0,
            totalVoiceMinutes: voiceLogs
                .filter(l => l.timestamp > cutoffTime)
                .reduce((total, log) => total + log.duration, 0)
        };
    },

    // En aktif kullanıcıları al
    getTopUsers(guildId, limit = 10, days = null) {
        const cutoffTime = days ? Date.now() - (days * 24 * 60 * 60 * 1000) : 0;
        const users = new Map();

        // Mesaj istatistiklerini topla
        for (const [key, timestamps] of messageStats) {
            if (key.startsWith(guildId)) {
                const userId = key.split('-')[1];
                const recentMessages = timestamps.filter(time => time > cutoffTime).length;
                users.set(userId, { messages: recentMessages, voiceMinutes: 0 });
            }
        }

        // Ses istatistiklerini topla
        for (const [key, logs] of voiceStats) {
            if (key.startsWith(guildId)) {
                const userId = key.split('-')[1];
                const recentVoice = logs
                    .filter(log => log.timestamp > cutoffTime)
                    .reduce((total, log) => total + log.duration, 0);

                const userData = users.get(userId) || { messages: 0, voiceMinutes: 0 };
                userData.voiceMinutes = recentVoice;
                users.set(userId, userData);
            }
        }

        // Toplam aktiviteye göre sırala
        return Array.from(users.entries())
            .map(([userId, stats]) => ({
                userId,
                ...stats
            }))
            .sort((a, b) => (b.messages * 1 + b.voiceMinutes * 0.5) - (a.messages * 1 + a.voiceMinutes * 0.5))
            .slice(0, limit);
    },

    // Sunucu istatistiklerini al
    getServerStats(guild, days = null) {
        const now = Date.now();
        const cutoffTime = days ? now - (days * 24 * 60 * 60 * 1000) : now - (24 * 60 * 60 * 1000);

        const activeUsers = Array.from(lastActive)
            .filter(([, time]) => time > cutoffTime).length;

        return {
            totalMembers: guild.memberCount,
            onlineMembers: guild.members.cache.filter(m => m.presence?.status === 'online').size,
            activeUsers24h: activeUsers,
            periodDays: days || 1,
            roles: guild.roles.cache.size,
            channels: {
                total: guild.channels.cache.size,
                text: guild.channels.cache.filter(c => c.type === 0).size,
                voice: guild.channels.cache.filter(c => c.type === 2).size
            }
        };
    }
};