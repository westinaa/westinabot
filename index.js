const {
    Client,
    GatewayIntentBits,
    Collection,
    ActivityType,
    EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.js");
const antiSpam = require("./utils/antiSpam.js");
const statistics = require("./utils/statistics.js");
const logger = require("./utils/logger.js");
const guard = require("./utils/guard.js");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running!");
});
app.listen(3000, () => {
    console.log("Web server is online!");
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildBans,
    ],
});

client.commands = new Collection();

// Komutları yükle
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// Sayaç sistemi modülünü dahil et
const counter = require("./utils/counter.js");

client.once("ready", () => {
    console.log(`${client.user.tag} hazır!`);

    // Bot hazır olduğunda progress mesajı gönder
    const readyMessage = `${client.user.tag} hazır!`;

    // Progress mesajı olarak etkinlik durumunu ayarla
    client.user.setActivity(readyMessage, {
        type: ActivityType.Playing,
    });

    // Eski izleme aktivitesini 5 saniye sonra geri yükle
    setTimeout(() => {
        client.user.setActivity("discord.gg/mabet", {
            type: ActivityType.Watching,
        });
    }, 5000);
});

// AntiLink sistemini dahil et
const antiLink = require("./utils/antiLink.js");

// Mesaj istatistiklerini takip et
client.on("messageCreate", async (message) => {
    if (!message.author.bot) {
        statistics.updateMessageStats(
            message.author.id,
            message.guild.id,
            message.channel.id,
        );

        // Anti-spam kontrolü devre dışı bırakıldı
        // if (antiSpam.checkSpam(message)) {
        //     return;
        // }

        // AntiLink kontrolü
        if (await antiLink.checkMessage(message)) {
            return;
        }

        if (!message.content.startsWith(config.prefix) || message.author.bot)
            return;

        const args = message.content
            .slice(config.prefix.length)
            .trim()
            .split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Ses komutları için özel işlem
        if (
            commandName === "çek" ||
            commandName === "git" ||
            commandName === "n"
        ) {
            const voiceCommand = client.commands.get("voice");
            if (voiceCommand) {
                try {
                    await voiceCommand.execute(message, args);
                    return;
                } catch (error) {
                    console.error("Ses komutu hatası:", error);
                    message.reply("Ses komutu uygulanırken bir hata oluştu!");
                    return;
                }
            }
        }

        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply("Komutu uygularken bir hata oluştu!");
        }
    }
});

// Rol oluşturma olayını dinle
client.on("roleCreate", async (role) => {
    const fetchedLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 30, // ROLE_CREATE
    });
    const roleLog = fetchedLogs.entries.first();
    if (!roleLog) return;

    const { executor } = roleLog;
    await guard.handleRoleChanges("CREATE", executor, role, role.guild);
});

// Rol silme olayını dinle
client.on("roleDelete", async (role) => {
    const fetchedLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 32, // ROLE_DELETE
    });
    const roleLog = fetchedLogs.entries.first();
    if (!roleLog) return;

    const { executor } = roleLog;
    await guard.handleRoleChanges("DELETE", executor, role, role.guild);
});

// Rol güncelleme olayını dinle
client.on("roleUpdate", async (oldRole, newRole) => {
    const fetchedLogs = await newRole.guild.fetchAuditLogs({
        limit: 1,
        type: 31, // ROLE_UPDATE
    });
    const roleLog = fetchedLogs.entries.first();
    if (!roleLog) return;

    const { executor } = roleLog;
    await guard.handleRoleChanges("UPDATE", executor, newRole, newRole.guild);
});

// Kanal oluşturma olayını dinle
client.on("channelCreate", async (channel) => {
    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 10, // CHANNEL_CREATE
    });
    const channelLog = fetchedLogs.entries.first();
    if (!channelLog) return;

    const { executor } = channelLog;
    await guard.handleChannelChanges(
        "CREATE",
        executor,
        channel,
        channel.guild,
    );
});

// Kanal silme olayını dinle
client.on("channelDelete", async (channel) => {
    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 12, // CHANNEL_DELETE
    });
    const channelLog = fetchedLogs.entries.first();
    if (!channelLog) return;

    const { executor } = channelLog;
    await guard.handleChannelChanges(
        "DELETE",
        executor,
        channel,
        channel.guild,
    );
});

// Kanal güncelleme olayını dinle
client.on("channelUpdate", async (oldChannel, newChannel) => {
    const fetchedLogs = await newChannel.guild.fetchAuditLogs({
        limit: 1,
        type: 20, // CHANNEL_UPDATE
    });
    const channelLog = fetchedLogs.entries.first();
    if (!channelLog) return;

    const { executor } = channelLog;
    await guard.handleChannelChanges(
        "UPDATE",
        executor,
        newChannel,
        newChannel.guild,
    );
});

// Ban olayını dinle
client.on("guildBanAdd", async (ban) => {
    const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 22, // MEMBER_BAN_ADD
    });
    const banLog = fetchedLogs.entries.first();
    if (!banLog) return;

    const { executor, reason } = banLog;
    await guard.handleMemberPunishment(
        "BAN",
        executor,
        ban.user,
        ban.guild,
        reason,
    );
});

// Kick olayını dinle
client.on("guildMemberRemove", async (member) => {
    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 20, // MEMBER_KICK
    });
    const kickLog = fetchedLogs.entries.first();

    // Eğer kick log bulunamazsa, bu bir kick değil normal çıkıştır
    if (!kickLog || kickLog.createdTimestamp < Date.now() - 5000) return;

    const { executor, reason } = kickLog;
    await guard.handleMemberPunishment(
        "KICK",
        executor,
        member.user,
        member.guild,
        reason,
    );
});

// Ses istatistiklerini takip et
const voiceStates = new Map();

client.on("voiceStateUpdate", (oldState, newState) => {
    const userId = newState.member.user.id;
    const guildId = newState.guild.id;

    // Kullanıcı ses kanalına katıldı
    if (!oldState.channelId && newState.channelId) {
        voiceStates.set(userId, {
            timestamp: Date.now(),
            channelId: newState.channelId,
        });
    }
    // Kullanıcı ses kanalından ayrıldı
    else if (oldState.channelId && !newState.channelId) {
        const joinData = voiceStates.get(userId);
        if (joinData) {
            const duration = (Date.now() - joinData.timestamp) / 60000; // Dakikaya çevir
            statistics.updateVoiceStats(
                userId,
                guildId,
                joinData.channelId,
                duration,
            );
            voiceStates.delete(userId);
        }
    }
    // Kullanıcı kanal değiştirdi
    else if (oldState.channelId !== newState.channelId) {
        const joinData = voiceStates.get(userId);
        if (joinData) {
            const duration = (Date.now() - joinData.timestamp) / 60000;
            statistics.updateVoiceStats(
                userId,
                guildId,
                joinData.channelId,
                duration,
            );
        }
        voiceStates.set(userId, {
            timestamp: Date.now(),
            channelId: newState.channelId,
        });
    }
});

// Üye girişlerini dinle (sayaç için)
client.on("guildMemberAdd", async (member) => {
    // Sayaç sistemine ilet
    await counter.handleJoin(member);
});

// Üye çıkışlarını dinle (sayaç için)
client.on("guildMemberRemove", async (member) => {
    // Sayaç sistemine ilet
    await counter.handleLeave(member);

    // Not: guildMemberRemove kick olayı için de tetiklenir, bu durumda guard.js tarafından da işlenecektir
});

// Discord token'ı doğrudan process.env'den al
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error("DISCORD_TOKEN bulunamadı!");
    process.exit(1);
}

client.login(token).catch((error) => {
    console.error("Bot başlatılırken hata oluştu:", error);
});
