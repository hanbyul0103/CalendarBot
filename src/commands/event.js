module.exports = {
    name: "event",
    description: "기숙사의 이벤트를 표시합니다.",
    async execute(message, args) {
        await message.reply("이벤트");
    },
};