const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    name: "yardım",
    description: "Botun komutlarını listeler",
    async execute(message, args) {
        // Define your specific commands for each category
        const generalCommands = [
            {
                name: ".davet",
                description:
                    "Bot davet linki ve destek sunucusu bilgilerini gösterir.",
            },
            { name: ".yardım", description: "Botun komutlarını listeler." },
            {
                name: ".n @kullanıcı / ID",
                description:
                    "Belirtilen kullanıcının hangi sesli kanalda olduğunu gösterir.",
            },
            // Add more general commands here as needed
        ];

        const moderationCommands = [
            {
                name: ".say",
                description: "Sesli odalarda bulunanların sayısını gösterir.",
            },
            {
                name: ".antilink",
                description:
                    "Discord davet linki engelleme sistemini açar veya kapatır.",
            },
            {
                name: ".sil [miktar]",
                description: "Belirtilen sayıda mesajı siler. (1-100 arası)",
            },
            {
                name: ".sicil [kullanıcı]",
                description: "Kullanıcının cezalarını görüntüler.",
            },
            {
                name: ".uyar @kullanıcı [sebep]",
                description: "Belirtilen kullanıcıyı uyarır.",
            },
            {
                name: ".mute @kullanıcı [süre] [sebep]",
                description: "Kullanıcıyı belirtilen süre boyunca susturur.",
            },
            {
                name: ".ban @kullanıcı [sebep]",
                description: "Kullanıcıyı sunucudan yasaklar.",
            },
            {
                name: ".jail @kullanıcı [süre] [sebep]",
                description: "Kullanıcıyı geçici olarak hapse atar.",
            },
            {
                name: ".kick @kullanıcı [sebep]",
                description: "Kullanıcıyı sunucudan atar.",
            },
            {
                name: ".unban ` ID ` [sebep]",
                description: "Kullanıcının yasaklamasını kaldırır.",
            },
            {
                name: ".unjail @kullanıcı [süre] [sebep]",
                description: "Kullanıcıyı hapisten çıkarır.",
            },
            { name: ".kilit", description: "Odayı kilitler." },
            { name: ".kilit-aç", description: "Odanın kilidini açar." },
            {
                name: ".çek @kullanıcı / ID",
                description: "Belirtilen kullanıcıyı odaya çeker.",
            },
            {
                name: ".git @kullanıcı / ID",
                description: "Belirtilen kullanıcının odasına gider.",
            },
            {
                name: ".rol ver/al @kullanıcı @rol",
                description: "Kullanıcıya rol verir veya alır.",
            },

            // Add more moderation commands from "commands/moderation"
        ];

        const adminCommands = [
            {
                name: ".restart",
                description: "Botu yeniden başlatır. (Sadece bot sahibi için)",
            },
            // Add more admin commands from "commands/admin"
        ];

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🛡️ Moderasyon Bot Komutları")
            .setDescription(
                "Komut kategorilerini seçmek için butonlara tıklayın.",
            );

        const generalButton = new ButtonBuilder()
            .setCustomId("general")
            .setLabel("Genel Komutlar")
            .setStyle(ButtonStyle.Primary);

        const moderationButton = new ButtonBuilder()
            .setCustomId("moderation")
            .setLabel("Moderasyon Komutları")
            .setStyle(ButtonStyle.Primary);

        const adminButton = new ButtonBuilder()
            .setCustomId("admin")
            .setLabel("Admin Komutları")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(
            generalButton,
            moderationButton,
            adminButton,
        );

        const helpMessage = await message.reply({
            embeds: [embed],
            components: [row],
        });

        const filter = (interaction) =>
            interaction.user.id === message.author.id;
        const collector = helpMessage.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on("collect", async (interaction) => {
            let responseEmbed;

            if (interaction.customId === "general") {
                responseEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("Genel Komutlar")
                    .setDescription(
                        generalCommands
                            .map((cmd) => `${cmd.name} - ${cmd.description}`)
                            .join("\n"),
                    );
            } else if (interaction.customId === "moderation") {
                responseEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("Moderasyon Komutları")
                    .setDescription(
                        moderationCommands
                            .map((cmd) => `${cmd.name} - ${cmd.description}`)
                            .join("\n"),
                    );
            } else if (interaction.customId === "admin") {
                responseEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("Admin Komutları")
                    .setDescription(
                        adminCommands
                            .map((cmd) => `${cmd.name} - ${cmd.description}`)
                            .join("\n"),
                    );
            }

            await interaction.reply({
                embeds: [responseEmbed],
                ephemeral: true,
            });
        });

        collector.on("end", () => {
            row.components.forEach((button) => button.setDisabled(true));
            helpMessage.edit({ components: [row] });
        });
    },
};
