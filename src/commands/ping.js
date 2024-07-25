module.exports = {
    handleSendPing: async (interaction) => {
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        return interaction.reply(`핑 : ${ping}ms`);
    },
};