module.exports = {
    name: "ping",
    description: "핑을 표시합니다.",
    async execute(message, args) {
        const sent = await message.reply('측정중...');
        const ping = sent.createdTimestamp - message.createdTimestamp;
        sent.edit(`핑 : ${ping}ms`);
    },
};