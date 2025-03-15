const { EmbedBuilder } = require('discord.js');
const { permissions } = require('./permissions.js');
const logger = require('./logger.js');

class Guard {
    constructor() {
        this.recentActions = new Map();
    }

    // Rol değişikliklerini izle
    async handleRoleChanges(action, executor, role, guild, reason = null) {
        if (permissions.checkModerator({ roles: { cache: executor.roles } })) {
            await this.logRoleAction(action, executor, role, guild, reason);
            return false;
        }

        // Sadece loglama yapılıyor, şüpheli bildirimi devre dışı
        await this.logRoleAction(action, executor, role, guild, reason, false);
        return false;
    }

    // Kanal değişikliklerini izle
    async handleChannelChanges(action, executor, channel, guild, reason = null) {
        if (permissions.checkModerator({ roles: { cache: executor.roles } })) {
            await this.logChannelAction(action, executor, channel, guild, reason);
            return false;
        }

        // Sadece loglama yapılıyor, şüpheli bildirimi devre dışı
        await this.logChannelAction(action, executor, channel, guild, reason, false);
        return false;
    }

    // Ban/Kick işlemlerini izle
    async handleMemberPunishment(action, executor, target, guild, reason = null) {
        // Moderatörler için sadece loglama yap
        if (permissions.checkModerator({ roles: { cache: executor.roles } })) {
            await this.logMemberAction(action, executor, target, guild, reason);
            return false;
        }

        // Sadece loglama yapılıyor, şüpheli bildirimi devre dışı
        await this.logMemberAction(action, executor, target, guild, reason, false);
        return false;
    }

    // Rol işlemlerini logla
    async logRoleAction(action, executor, role, guild, reason, isSuspicious = false) {
        const embed = new EmbedBuilder()
            .setColor(isSuspicious ? '#ff0000' : '#ffa500')
            .setTitle(`${isSuspicious ? '⚠️ Şüpheli ' : ''}Rol İşlemi: ${action}`)
            .setDescription(`**${role.name}** rolü üzerinde işlem yapıldı`)
            .addFields(
                { name: '👤 İşlemi Yapan', value: executor.tag, inline: true },
                { name: '📝 İşlem', value: action, inline: true },
                { name: '❓ Sebep', value: reason || 'Belirtilmedi' }
            )
            .setTimestamp()
            .setFooter({ text: guild.name });

        await logger.log(guild, `ROLE-${action}`, executor, { tag: role.name }, reason || 'Sebep belirtilmedi');
    }

    // Kanal işlemlerini logla
    async logChannelAction(action, executor, channel, guild, reason, isSuspicious = false) {
        const embed = new EmbedBuilder()
            .setColor(isSuspicious ? '#ff0000' : '#00ff00')
            .setTitle(`${isSuspicious ? '⚠️ Şüpheli ' : ''}Kanal İşlemi: ${action}`)
            .setDescription(`**${channel.name}** kanalı üzerinde işlem yapıldı`)
            .addFields(
                { name: '👤 İşlemi Yapan', value: executor.tag, inline: true },
                { name: '📝 İşlem', value: action, inline: true },
                { name: '❓ Sebep', value: reason || 'Belirtilmedi' }
            )
            .setTimestamp()
            .setFooter({ text: guild.name });

        await logger.log(guild, `CHANNEL-${action}`, executor, { tag: channel.name }, reason || 'Sebep belirtilmedi');
    }

    // Üye işlemlerini logla
    async logMemberAction(action, executor, target, guild, reason, isSuspicious = false) {
        const embed = new EmbedBuilder()
            .setColor(isSuspicious ? '#ff0000' : action === 'BAN' ? '#dc143c' : '#ffa500')
            .setTitle(`${isSuspicious ? '⚠️ Şüpheli ' : ''}Üye İşlemi: ${action}`)
            .setDescription(`**${target.tag}** kullanıcısı üzerinde işlem yapıldı`)
            .addFields(
                { name: '👤 İşlemi Yapan', value: executor.tag, inline: true },
                { name: '📝 İşlem', value: action, inline: true },
                { name: '❓ Sebep', value: reason || 'Belirtilmedi' }
            )
            .setTimestamp()
            .setFooter({ text: guild.name });

        await logger.log(guild, action, executor, target, reason || 'Sebep belirtilmedi');
    }

    // Moderatörlere bildirim gönder (devre dışı bırakıldı)
    async notifyModerators(guild, data) {
        // Şüpheli hareket bildirimleri devre dışı bırakıldı
        console.log(`Şüpheli işlem algılandı: ${data.type} - ${data.executor.tag} - ${data.action}`);
        return;
        
        /* Eski bildirim kodu:
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ Şüpheli İşlem Bildirimi')
            .setDescription(`${data.type} kategorisinde şüpheli işlemler tespit edildi`)
            .addFields(
                { name: '👤 Şüpheli Kullanıcı', value: data.executor.tag, inline: true },
                { name: '📝 İşlem', value: data.action, inline: true },
                { name: '🎯 Hedef', value: data.target.name || data.target.tag || 'Bilinmiyor', inline: true },
                { name: '❓ Sebep', value: data.reason }
            )
            .setTimestamp()
            .setFooter({ text: guild.name });

        const moderators = guild.members.cache.filter(member => 
            permissions.checkModerator(member)
        );

        for (const moderator of moderators.values()) {
            try {
                await moderator.send({ embeds: [embed] });
            } catch (error) {
                console.error(`DM gönderilemedi: ${moderator.user.tag}`);
            }
        }
        */
    }
}

module.exports = new Guard();