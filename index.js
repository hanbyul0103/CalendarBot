const config = require('./src/config/config.json');
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});

const cron = require('node-cron');

client.on('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async member => {
    const channelID = '1265224199509901374';
    const channel = client.channels.cache.get(channelID);
    if (channel) {
        channel.send(`안녕하세요, ${member}님! 닉네임을 \`본명 (학년)\`으로 바꿔주세요.`);
    }

    const role = member.guild.roles.cache.find(role => role.name === '1학년'); // 'Newbie'는 역할 이름입니다.
    if (role) {
        await member.roles.add(role);
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "calendar") {
        const action = interaction.options.get('action')?.value;
        const event = interaction.options.get('event')?.value;
        const day = interaction.options.get('day')?.value;

        interaction.reply(`${action}, ${event}, ${day}`);
    }
});

cron.schedule('0 0 1 * *', () => {
    const channelID = '1263159851740172479';
    const channel = client.channels.cache.get(channelID);
    if (channel) {
        channel.send("> calendar");
    }
    else {
        channel.send("채널을 찾을 수 없습니다.");
    }
}, {
    scheduled: true,
    timezone: "Asia/Seoul"
});

client.login(config.token);