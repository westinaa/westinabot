
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { permissions } = require("../../utils/permissions.js");

module.exports = {
    name: "voice",
    description: "Ses kanalı yönetim komutları",
    async execute(message, args) {
        // Ana komut türünü belirle
        const command = message.content.substring(1).split(" ")[0].toLowerCase();
        
        // Eğer komut çek, git veya n değilse işlemi durdur
        if (!["çek", "git", "n"].includes(command)) return;
        
        // Hedef kullanıcıyı belirle (etiket veya ID)
        let target;
        
        // Etiketlenen kullanıcıyı kontrol et
        if (message.mentions.members.size > 0) {
            target = message.mentions.members.first();
        } 
        // ID girilen kullanıcıyı kontrol et
        else if (args.length > 0) {
            try {
                target = await message.guild.members.fetch(args[0]);
            } catch (error) {
                return message.reply("❌ Geçerli bir kullanıcı ID'si girmelisin!");
            }
        } else {
            return message.reply("❌ Bir kullanıcı etiketlemen ya da ID girmen gerekiyor!");
        }

        // Çek komutu: Etiketlenen kullanıcıyı kendi kanalına çeker
        if (command === "çek") {
            if (!message.member.voice.channel) {
                return message.reply("❌ Önce bir ses kanalına katılmalısın!");
            }
            
            if (!target.voice.channel) {
                return message.reply(`❌ ${target.user.tag} herhangi bir ses kanalında değil!`);
            }

            if (!permissions.checkModerator(message.member) && !message.member.permissions.has("MoveMembers")) {
                return message.reply("❌ Bu komutu kullanma yetkiniz yok!");
            }

            try {
                await target.voice.setChannel(message.member.voice.channel.id);
                const successEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("<a:wonay:1350962279537180785> Transfer Başarılı.")
                    .setDescription(`<:utlarrowscratch7:1345857197871206400> ${target.user.tag} kullanıcısı **${message.member.voice.channel.name}** kanalına çekildi.`)
                    .setTimestamp()
                    .setFooter({ text: message.guild.name });
                
                message.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error("Kullanıcı çekme hatası:", error);
                message.reply("❌ Kullanıcı çekilirken bir hata oluştu!");
            }
        }
        
        // Git komutu: Komutu kullanan kullanıcıyı, etiketlediği kullanıcının kanalına gönderir
        else if (command === "git") {
            if (!message.member.voice.channel) {
                return message.reply("<a:wuyari:1349419056129642546> Önce bir ses kanalına katılmalısın!");
            }
            
            if (!target.voice.channel) {
                return message.reply(`<a:wuyari:1349419056129642546> ${target.user.tag} herhangi bir ses kanalında değil!`);
            }

            try {
                await message.member.voice.setChannel(target.voice.channel.id);
                const successEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("<a:wonay:1350962279537180785> Transfer Başarılı.")
                    .setDescription(`<:utlarrowscratch7:1345857197871206400> **${target.voice.channel.name}** kanalına başarıyla gidildi.`)
                    .setTimestamp()
                    .setFooter({ text: message.guild.name });
                
                message.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error("Kanala gitme hatası:", error);
                message.reply("❌ Kanala gidilirken bir hata oluştu!");
            }
        }
        
        // n komutu: Etiketlenen kullanıcının hangi kanalda olduğunu gösterir ve butonlar oluşturur
        else if (command === "n") {
            if (!target.voice.channel) {
                return message.reply(`<a:wuyari:1349419056129642546> ${target.user.tag} herhangi bir ses kanalında değil!`);
            }
            
            const infoEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("<:voice:1349504902703091743> Seste Nerede?")
                .setDescription(`**${target.user.tag}** kullanıcısı şu anda **${target.voice.channel.name}** kanalında.`)
                .setTimestamp()
                .setFooter({ text: message.guild.name });
            
            // Çek ve Git butonları oluştur
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`voice_pull_${target.id}`)
                        .setLabel("Kanalıma Çek")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("<:wcek:1350963412867223712>"),
                    new ButtonBuilder()
                        .setCustomId(`voice_goto_${target.id}`)
                        .setLabel("Kanalına Git")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("<:seta:1346909730173354054>")
                );
            
            const response = await message.reply({ embeds: [infoEmbed], components: [row] });
            
            // Buton interaksiyonlarını dinle
            const filter = i => i.user.id === message.author.id && 
                               (i.customId === `voice_pull_${target.id}` || i.customId === `voice_goto_${target.id}`);
            
            const collector = response.createMessageComponentCollector({ filter, time: 60000 });
            
            collector.on('collect', async interaction => {
                try {
                    await interaction.deferUpdate();
                    
                    // Kullanıcının ses kanalında olup olmadığını kontrol et
                    if (!message.member.voice.channel) {
                        await interaction.followUp({ 
                            content: "<a:wuyari:1349419056129642546> Önce bir ses kanalına katılmalısın!", 
                            ephemeral: true 
                        });
                        return;
                    }
                    
                    // Hedef kullanıcının ses kanalında olup olmadığını kontrol et
                    if (!target.voice.channel) {
                        await interaction.followUp({ 
                            content: `<a:wuyari:1349419056129642546> ${target.user.tag} artık bir ses kanalında değil!`, 
                            ephemeral: true 
                        });
                        return;
                    }
                    
                    // Buton aksiyonlarını işle
                    if (interaction.customId === `voice_goto_${target.id}`) {
                        await message.member.voice.setChannel(target.voice.channel.id);
                        await interaction.followUp({ 
                            content: `<a:wonay:1350962279537180785> **${target.voice.channel.name}** kanalına başarıyla gidildi.`, 
                            ephemeral: true 
                        });
                    } 
                    else if (interaction.customId === `voice_pull_${target.id}`) {
                        if (!permissions.checkModerator(message.member) && !message.member.permissions.has("MoveMembers")) {
                            await interaction.followUp({ 
                                content: "<a:wuyari:1349419056129642546> Bu işlemi yapma yetkiniz yok!", 
                                ephemeral: true 
                            });
                            return;
                        }
                        
                        await target.voice.setChannel(message.member.voice.channel.id);
                        await interaction.followUp({ 
                            content: `<a:wonay:1350962279537180785> **${target.user.tag}** kullanıcısı kanalınıza çekildi.`, 
                            ephemeral: true 
                        });
                    }
                } catch (error) {
                    console.error("Ses komutu interaksiyon hatası:", error);
                    await interaction.followUp({ 
                        content: "❌ İşlem sırasında bir hata oluştu!", 
                        ephemeral: true 
                    });
                }
            });
            
            collector.on('end', () => {
                response.edit({ components: [] }).catch(console.error);
            });
        }
    },
};
