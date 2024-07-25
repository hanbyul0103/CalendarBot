const { Client, GatewayIntentBits, Partials } = require('discord.js');
const moment = require('moment-timezone');
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const { token } = require('../config/config.json');

// 한글 폰트를 사용할 수 있도록 폰트 파일을 등록합니다. (나눔고딕 폰트 예시)
// registerFont(path.join(__dirname, './Fonts/nanumGothic.ttf'), { family: 'Nanum Gothic' });

const timeZone = 'Asia/Seoul';
const colorMap = {
    'e': 'rgb(100, 255, 100)',
    'f': 'rgb(255, 100, 100)',
    'SUNDAY': 'rgb(255, 100, 100)',
    'SATURDAY': 'rgb(100, 100, 255)'
};

let calendarData = {};

const scaleFactor = 3;
const titleHeight = 140 * scaleFactor;
const headerHeight = 100 * scaleFactor;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === '캘린더') {
        const today = moment().tz(timeZone);
        const year = today.year();
        const month = today.month() + 1;

        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'add') {
            const eventType = interaction.options.getString('type');
            const day = interaction.options.getInteger('day');

            if (!['e', 'f'].includes(eventType)) {
                return await interaction.reply("유효하지 않은 이벤트 타입입니다.");
            }

            if (day < 1 || day > 31) {
                return await interaction.reply("유효하지 않은 날짜입니다.");
            }

            if (eventType === 'e') {
                addEventE(year, month, day);
                return await interaction.reply(`엘리베이터의 주가 ${day}일로부터 주말을 제외한 5일로 설정되었습니다.`);
            }

            if (eventType === 'f') {
                addEventF(year, month, day);
                return await interaction.reply(`${day}일에 자유의 날 이벤트가 추가되었습니다.`);
            }
        } else if (subCommand === 'remove') {
            const eventType = interaction.options.getString('type');

            if (!['e', 'f'].includes(eventType)) {
                return await interaction.reply("유효하지 않은 이벤트 타입입니다.");
            }

            const colorToRemove = colorMap[eventType];
            let removed = removeEvents(eventType, colorToRemove);

            if (removed) {
                return await interaction.reply(`${eventType === 'e' ? '엘리베이터의 주가' : '자유의 날'} 모든 이벤트가 삭제되었습니다.`);
            } else {
                return await interaction.reply("해당 이벤트 타입의 이벤트가 없습니다.");
            }
        }

        // 캘린더 생성 및 이미지 파일로 저장
        try {
            await generateCalendarImage(interaction, today);
        } catch (error) {
            console.error('캘린더 이미지 생성 중 오류 발생:', error);
            await interaction.reply('캘린더 이미지 생성 중 오류가 발생했습니다.');
        }
    }
});

client.login(token);

// 이벤트 타입 e의 이벤트 추가
function addEventE(year, month, day) {
    let startDate = moment.tz(`${year}-${String(month).padStart(2, '0')}-${day}`, timeZone);
    let daysAdded = 0;

    while (daysAdded < 5) {
        if (startDate.day() !== 0 && startDate.day() !== 6) { // 주말을 제외한 날짜
            const dateStr = startDate.format('YYYY-MM-DD');
            if (!calendarData[dateStr]) calendarData[dateStr] = [];
            calendarData[dateStr].push({ color: colorMap['e'] });
            daysAdded++;
        }
        startDate.add(1, 'day');
    }
}

// 이벤트 타입 f의 이벤트 추가
function addEventF(year, month, day) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!calendarData[date]) calendarData[date] = [];
    calendarData[date].push({ color: colorMap['f'], type: 'circle' });
}

// 이벤트 삭제
function removeEvents(eventType, colorToRemove) {
    let removed = false;

    for (const [date, events] of Object.entries(calendarData)) {
        calendarData[date] = events.filter(event => {
            if (eventType === 'e' && event.color === colorToRemove) {
                removed = true;
                return false;
            }
            if (eventType === 'f' && event.type === 'circle' && event.color === colorToRemove) {
                removed = true;
                return false;
            }
            return true;
        });

        if (calendarData[date].length === 0) delete calendarData[date];
    }

    return removed;
}

// 캘린더 이미지 생성
async function generateCalendarImage(interaction, today) {
    const startOfMonth = today.clone().startOf('month');
    const endOfMonth = today.clone().endOf('month');
    const daysInMonth = endOfMonth.date();
    const startDay = startOfMonth.day();

    const canvasWidth = 700 * scaleFactor;
    const cellSize = 100 * scaleFactor;
    const calendarRows = 6;
    const canvasHeight = titleHeight + headerHeight + cellSize * calendarRows;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // 배경색 설정
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 제목 설정
    ctx.fillStyle = 'black';
    ctx.font = `${60 * scaleFactor}px Nanum Gothic`; // 제목의 폰트 사이즈를 60으로 설정
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${today.format('MM월')}`, canvasWidth / 2, titleHeight / 2); // 제목 위치 조정

    // 요일 헤더 그리기
    drawWeekHeaders(ctx, scaleFactor, headerHeight, cellSize);

    // 날짜 및 이벤트 그리기
    drawDays(ctx, startOfMonth, daysInMonth, startDay, cellSize);

    // 이미지 파일로 저장
    const filePath = './calendar.png';
    try {
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);

        // 이미지 파일을 임베드에 추가
        const calendarEmbed = new MessageEmbed()
            .setTitle(`7월의 기숙사 현황입니다.`)
            .setColor('WHITE')
            .setImage('attachment://calendar.png');

        await interaction.reply({ embeds: [calendarEmbed], files: [{ attachment: filePath, name: 'calendar.png' }] });
    } catch (error) {
        console.error('파일 저장 또는 메시지 전송 중 오류 발생:', error);
        await interaction.reply('파일 저장 또는 메시지 전송 중 오류가 발생했습니다.');
    } finally {
        // 이미지 파일 삭제
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error('파일 삭제 중 오류 발생:', error);
        }
    }
}

// 요일 헤더 그리기
function drawWeekHeaders(ctx, scaleFactor, cellSize) {
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    const headerBackgroundColor = 'lightgray';
    let xOffset = 0;
    let yOffset = titleHeight; // 제목 아래로 시작

    ctx.font = `${30 * scaleFactor}px Nanum Gothic`;
    ctx.textAlign = 'center';

    daysOfWeek.forEach((day, i) => {
        ctx.fillStyle = headerBackgroundColor;
        ctx.fillRect(xOffset, yOffset, cellSize, cellSize);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeRect(xOffset, yOffset, cellSize, cellSize);
        ctx.fillStyle = 'black';
        ctx.fillText(day, xOffset + cellSize / 2, yOffset + cellSize / 2 + 5);
        xOffset += cellSize;
    });
}

// 날짜 및 이벤트 그리기
function drawDays(ctx, startOfMonth, daysInMonth, startDay, cellSize) {
    let xOffset = 0;
    let yOffset = titleHeight + headerHeight; // 제목 + 헤더 아래로 시작
    let dayCount = 1;
    const calendarRows = 6;

    for (let row = 0; row < calendarRows; row++) {
        for (let col = 0; col < 7; col++) {
            if (row === 0 && col < startDay) {
                // 첫 번째 주의 빈 셀
            } else if (dayCount <= daysInMonth) {
                const currentDate = startOfMonth.clone().date(dayCount);
                const currentDateStr = `${startOfMonth.year()}-${String(startOfMonth.month() + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                const dayEvents = calendarData[currentDateStr] || [];

                // 배경색 설정
                let fillColor = (currentDate.day() === 0 ? colorMap['SUNDAY'] : (currentDate.day() === 6 ? colorMap['SATURDAY'] : 'white'));
                ctx.fillStyle = fillColor;
                ctx.fillRect(xOffset, yOffset, cellSize, cellSize);

                drawEvents(ctx, dayEvents, xOffset, yOffset, cellSize);

                // 날짜 텍스트
                ctx.fillStyle = 'black';
                ctx.font = `${24 * scaleFactor}px Nanum Gothic`;
                ctx.textAlign = 'center';
                ctx.fillText(dayCount, xOffset + cellSize / 2, yOffset + cellSize / 2 + 5);

                dayCount++;
            }

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeRect(xOffset, yOffset, cellSize, cellSize);
            xOffset += cellSize;
        }
        xOffset = 0;
        yOffset += cellSize;
    }
}

// 날짜 셀에 이벤트 그리기
function drawEvents(ctx, events, xOffset, yOffset, cellSize) {
    // 먼저 배경색 이벤트를 그립니다.
    events.forEach(event => {
        if (event.color && !event.type) {
            // 배경색 이벤트
            ctx.fillStyle = event.color;
            ctx.fillRect(xOffset, yOffset, cellSize, cellSize);
        }
    });

    // 이후 동그라미 이벤트를 그립니다.
    events.forEach(event => {
        if (event.type === 'circle') {
            ctx.strokeStyle = colorMap['f'];
            ctx.lineWidth = 4;
            ctx.beginPath();
            const circleRadius = cellSize / 3;
            ctx.arc(xOffset + cellSize / 2, yOffset + cellSize / 2, circleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}