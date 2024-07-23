const config = require('../config/config.json');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (message.author.bot) return; // 봇 메시지 무시하기
        if (!message.content.startsWith(config.prefix)) return; // 접두사로 시작하지 않으면 무시하기

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('명령어를 실행하는 도중에 오류가 발생했습니다.');
        }
    },
};