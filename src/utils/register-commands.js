const config = require('../config/config.json');
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: "ping",
        description: 'Reply Latency Rate',
    },

    {
        name: "calendar",
        description: 'Manage calendar',
        options: [
            {
                name: 'action',
                description: '행동을 선택하세요',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'add', value: 'add', },
                    { name: 'remove', value: 'remove', },
                ],
            },
            {
                name: 'event',
                description: '이벤트를 선택하세요',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: '엘리베이터의 주', value: 'e', },
                    { name: '자유의 날', value: 'f', },
                ],
            },
            {
                name: 'day',
                description: '날짜를 입력하세요',
                type: ApplicationCommandOptionType.Number,
            },
        ],
    },

    {
        name: "help",
        description: 'Reply to help',
    },

    {
        name: "find",
        description: 'Reply with information about the person you are looking for',
    },

    {
        name: "event",
        description: 'reply event',
    },
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('registering slash commands...');

        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });

        console.log('slash commands were registered successfully');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();