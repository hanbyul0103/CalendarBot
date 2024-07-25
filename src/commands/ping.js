module.exports = {
    handleSendPing: async (interaction) => {
        const sent = await interaction.reply('측정중...');
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        sent.edit(`핑 : ${ping}ms`);
    },
};