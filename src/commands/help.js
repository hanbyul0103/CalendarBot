module.exports = {
    name: "help",
    description: "도움말을 표시합니다.",
    async execute(message, args) {
        const helpMessage = "** **\n\`< help\` - 도움말을 표시합니다.\n\`< calendar\` - 캘린더를 표시합니다.\n** **";
        await message.reply(helpMessage);
    },
};