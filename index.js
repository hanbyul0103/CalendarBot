const config = require('./src/config/config.json');
const { Client, Intents, Collection } = require('discord.js');
const cron = require('node-cron');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, // 필수로 포함되어야 합니다
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS
        // 필요한 Intents를 여기에 추가하세요
    ],
});
client.commands = new Collection();
const fs = require('fs');
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

// 이벤트 핸들러 로딩
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

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

client.login(config.TOKEN);