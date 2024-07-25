module.exports = {
    handleSendHelp: async (interaction) => {
        const helpMessage = "** **\n\`< help\` - 도움말을 표시합니다.\n\`< calendar\` - 캘린더를 표시합니다.\n** **";
        return interaction.reply(helpMessage);
    },
};