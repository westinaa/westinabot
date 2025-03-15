module.exports = {
    name: 'ping',
    description: 'Botun ve API\'nin gecikme sürelerini gösterir.',
    async execute(message, args) {
        const pingEmoji = '<a:w_load:1350582644324438067>'; // Bot gecikmesi için emoji
        const apiEmoji = '<a:w_loading:1350582535264010240>';   // API gecikmesi için emoji

        const initialMessage = await message.channel.send(`${pingEmoji} Pong isteği gönderildi...`);
        const ping = initialMessage.createdTimestamp - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);

        await initialMessage.edit(`${pingEmoji} **Gecikme:** ${ping}ms\n${apiEmoji} **API Gecikmesi:** ${apiPing}ms`);
    },
};
