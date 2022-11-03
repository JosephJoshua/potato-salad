import nodeCanvas from 'canvas';
import { ActionRowBuilder, AttachmentBuilder, bold, ButtonBuilder, ComponentType, inlineCode, SlashCommandBuilder, spoiler } from 'discord.js';

import { primary, secondary } from '../../helpers/colors.js';
import DefaultEmbed from '../../helpers/embeds.js';
import { formatDuration, pluralize } from '../../helpers/formatter.js';

const BOARD_SIZE = 3;
const CANVAS_SIZE = 600, CANVAS_PADDING = 30;
const SECTION_SIZE = (CANVAS_SIZE - 2 * CANVAS_PADDING) / BOARD_SIZE;

const getCanvasPosition = boardIndex => {
    return boardIndex * SECTION_SIZE + CANVAS_PADDING;
};

const drawBoardLines = ctx => {

    ctx.beginPath();

    for (let i = 1; i < BOARD_SIZE; i++) {
        const position = getCanvasPosition(i);
        ctx.moveTo(position, CANVAS_PADDING + ctx.lineWidth / 2);
        ctx.lineTo(position, CANVAS_SIZE - CANVAS_PADDING - ctx.lineWidth / 2);
        ctx.moveTo(CANVAS_PADDING + ctx.lineWidth / 2, position);
        ctx.lineTo(CANVAS_SIZE - CANVAS_PADDING - ctx.lineWidth / 2, position);
    }

    ctx.stroke();
};

const drawX = (ctx, x, y) => {

    const margin = SECTION_SIZE / 4 + ctx.lineWidth / 2;

    ctx.beginPath();

    ctx.moveTo(x + margin, y + margin);
    ctx.lineTo(x + SECTION_SIZE - margin, y + SECTION_SIZE - margin);

    ctx.moveTo(x + margin, y + SECTION_SIZE - margin);
    ctx.lineTo(x + SECTION_SIZE - margin, y + margin);

    ctx.stroke();
};

const drawO = (ctx, x, y) => {

    const margin = SECTION_SIZE / 2;

    const centerX = x + SECTION_SIZE / 2;
    const centerY = y + SECTION_SIZE / 2;
    const radius = (SECTION_SIZE - margin) / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
};

const endGame = (interaction, boardButtons, currentPlayer, player, opponent, turnCount, winningLine) => {

    const { client } = interaction;

    const canvas = nodeCanvas.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext('2d');

    // Draw board background.
    ctx.fillStyle = '#22262A';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Color background for winning cells.
    ctx.fillStyle = '#3D4D5C';
    winningLine.forEach(index => {
        const x = getCanvasPosition(index % BOARD_SIZE);
        const y = getCanvasPosition(Math.floor(index / BOARD_SIZE));
        ctx.fillRect(x, y, SECTION_SIZE, SECTION_SIZE);
    });

    // Draw board lines.
    ctx.lineWidth = SECTION_SIZE / 30;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#E6E6E6';
    drawBoardLines(ctx);

    // Draw X and O.
    ctx.lineWidth = SECTION_SIZE / 15;
    boardButtons.flatMap(row => row.components)
        .forEach((cell, index) => {
            const x = getCanvasPosition(index % BOARD_SIZE);
            const y = getCanvasPosition(Math.floor(index / BOARD_SIZE));

            if (cell.data.label == 'X') {
                ctx.strokeStyle = primary;
                drawX(ctx, x, y);
            }
            if (cell.data.label == 'O') {
                ctx.strokeStyle = secondary;
                drawO(ctx, x, y);
            }
        });

    const fileName = 'result.png';
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: fileName });

    const header = bold(`${player} (X) vs. ${opponent} (O)`);
    const description = winningLine.length
        ? `${currentPlayer} won the game after a total of ${pluralize(turnCount, 'move')}!`
        : 'It was a tie!';

    const embed = new DefaultEmbed(client)
        .setDescription(`${header}\n\n${description}`)
        .setImage(`attachment://${fileName}`);

    interaction.editReply({
        embeds: [embed],
        components: [],
        files: [attachment],
    });
};

const generateDescription = (waitingForOpponent, currentPlayer, player, opponent) => {

    const header = bold(`${player} (X) vs. ${opponent ?? '???'} (O)`);

    if (waitingForOpponent) {
        return `${header}
        
        Waiting for someone to join the game...
        You can join the game by using the buttons below to make a move!`;
    }

    return `${header}

    It's ${currentPlayer}'s turn! Use the buttons below to make a move.`;
};

const generateBoardButtons = () => {

    const boardButtons = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
        const actionRow = new ActionRowBuilder();
        for (let j = 0; j < BOARD_SIZE; j++) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId((i * BOARD_SIZE + j).toString())
                    .setLabel('\u200b')
                    .setStyle('Secondary'),
            );
        }
        boardButtons.push(actionRow);
    }

    return boardButtons;
};

const setReminder = (interaction, currentPlayer, prevReminders, reminderDelay) => {
    return setTimeout(async () => {
        const prevReminder = await interaction.followUp({
            content: `${currentPlayer} It's your turn now!`,
            fetchReply: true,
        });
        prevReminders.push(prevReminder);
    }, reminderDelay);
};

const getWinningLine = (boardButtons, turnCount) => {
    // Winning a game requires at least 2n - 1 moves.
    if (turnCount < 2 * BOARD_SIZE - 1) return null;

    const board = boardButtons.map(row => row.components.map(button => {
        switch (button.data.label) {
            case 'X':
                return -1;
            case 'O':
                return 1;
            default:
                return 0;
        }
    }));

    // Horizontal n-in-a-row.
    const horizontalIndex = board.map(row => row.reduce((a, b) => a + b))
        .findIndex(total => [-BOARD_SIZE, BOARD_SIZE].some(size => total == size));

    if (~horizontalIndex)
        return [...Array(BOARD_SIZE).keys()].map(index => horizontalIndex * BOARD_SIZE + index);

    // Vertical n-in-a-row.
    const verticalIndex = board.reduce((row1, row2) => row1.map((val, index) => val + row2[index]))
        .findIndex(total => [-BOARD_SIZE, BOARD_SIZE].some(size => total == size));

    if (~verticalIndex)
        return [...Array(BOARD_SIZE).keys()].map(index => index * BOARD_SIZE + verticalIndex);

    // Diagonal n-in-a-row.
    const diagonalValues1 = [...Array(BOARD_SIZE).keys()].map(index => board[index][index]);

    if ([-BOARD_SIZE, BOARD_SIZE].some(size => diagonalValues1.reduce((a, b) => a + b) == size))
        return [...Array(BOARD_SIZE).keys()].map(index => index * (BOARD_SIZE + 1));

    const diagonalValues2 = [...Array(BOARD_SIZE).keys()].map(index => board[index][BOARD_SIZE - index - 1]);

    if ([-BOARD_SIZE, BOARD_SIZE].some(size => diagonalValues2.reduce((a, b) => a + b) == size))
        return [...Array(BOARD_SIZE).keys()].map(index => (index + 1) * (BOARD_SIZE - 1));

    if (turnCount == BOARD_SIZE * BOARD_SIZE) return [];

    return null;
};

const startGame = async (interaction, opponent = null) => {

    const { client } = interaction;
    const player = interaction.user;

    let currentPlayer = player;
    let waitingForOpponent = false;

    const embed = new DefaultEmbed(client)
        .setTitle('Tic-Tac-Toe')
        .setDescription(generateDescription(waitingForOpponent, currentPlayer, player, opponent));

    const boardButtons = generateBoardButtons();

    const message = await interaction.editReply({
        embeds: [embed],
        components: boardButtons,
        fetchReply: true,
    });

    const moveDuration = 300_000;
    const reminderDelay = 15_000;

    const collector = await message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: moveDuration,
    });

    let turnCount = 1;
    let winningLine = null;

    let prevReminders = [];
    let reminderTimeout = setReminder(interaction, currentPlayer, prevReminders, reminderDelay);

    collector.on('collect', async i => {

        if (waitingForOpponent) {
            if (i.user.id == player.id)
                return i.reply({ content: 'You have to wait for someone to join your game!', ephemeral: true });

            waitingForOpponent = false;
            currentPlayer = opponent = i.user;
        }

        if (i.user.id != currentPlayer.id)
            return i.reply({ content: 'It\'s not currently your turn!', ephemeral: true });

        if (!opponent) waitingForOpponent = true;

        clearTimeout(reminderTimeout);
        prevReminders.forEach(reminder => {
            reminder.delete();
        });
        prevReminders = [];

        boardButtons.flatMap(row => row.components)[+i.customId]
            .setLabel(turnCount % 2 ? 'X' : 'O')
            .setStyle(turnCount % 2 ? 'Danger' : 'Primary')
            .setDisabled(true);

        winningLine = getWinningLine(boardButtons, turnCount);
        if (winningLine) return collector.stop('end');

        await i.deferUpdate();

        currentPlayer = ++turnCount % 2 ? player : opponent;

        embed.setDescription(generateDescription(waitingForOpponent, currentPlayer, player, opponent));
        i.editReply({ embeds: [embed], components: boardButtons });

        collector.resetTimer();

        if (!opponent) return;

        reminderTimeout = setReminder(interaction, currentPlayer, prevReminders, reminderDelay);
    });

    collector.on('end', (_, reason) => {

        if (reason == 'end') return endGame(interaction, boardButtons, currentPlayer, player, opponent, turnCount, winningLine);

        if (reason == 'time') {

            boardButtons.flatMap(row => row.components)
                .forEach(button => {
                    button.setDisabled(true);
                });

            const infoButton = new ButtonBuilder()
                .setCustomId('info')
                .setLabel(`Expired after ${formatDuration(moveDuration)}`)
                .setStyle('Secondary')
                .setDisabled(true);

            boardButtons.push(new ActionRowBuilder().addComponents(infoButton));
            message.edit({ components: boardButtons });
        }
    });
};

const sendChallenge = async (interaction, opponent) => {

    const { client } = interaction;
    const player = interaction.user;
    const collectorDuration = 300_000;

    const embed = new DefaultEmbed(client)
        .setTitle('Tic-Tac-Toe')
        .setDescription(`${opponent}, ${player} challenges you to a game of Tic-Tac-Toe!`);

    const infoButton = new ButtonBuilder()
        .setCustomId('info')
        .setLabel(`Expires in ${formatDuration(collectorDuration)}`)
        .setStyle('Secondary')
        .setDisabled(true);

    const buttons = [
        new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setStyle('Success'),

        new ButtonBuilder()
            .setCustomId('decline')
            .setLabel('Decline')
            .setStyle('Danger'),

        infoButton,
    ];

    const actionRow = new ActionRowBuilder().addComponents(buttons);

    const message = await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        fetchReply: true,
    });

    const followUp = await interaction.followUp({
        content: `${opponent}, ${player} challenges you to a game of Tic-Tac-Toe!`,
        allowedMentions: {
            users: [opponent.id],
        },
        fetchReply: true,
    });

    const collector = await message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: collectorDuration,
    });

    let finalButtonInteraction = null;

    collector.on('collect', i => {

        if (i.user.id == player.id)
            return i.reply({ content: `You can't ${i.customId} your own challenge...`, ephemeral: true });


        if (i.user.id != opponent.id)
            return i.reply({ content: 'You didn\'t get invited...', ephemeral: true });

        finalButtonInteraction = i;
        collector.stop(i.customId);
    });

    collector.on('end', (_, reason) => {

        if (reason == 'accept') {
            finalButtonInteraction.deferUpdate();
            startGame(interaction, opponent);
        }

        buttons.forEach(button => {
            button.setDisabled(true);
        });

        if (reason == 'decline') {
            infoButton.setLabel('Challenge was declined');
            finalButtonInteraction.update({ components: [actionRow] });
        }

        if (reason == 'time') {
            infoButton.setLabel(`Expired after ${formatDuration(collectorDuration)}`);
            message.edit({ components: [actionRow] });
        }

        followUp.delete();
    });
};

export const data = new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Challenge someone to a game of Tic-Tac-Toe!')
    .addUserOption(option =>
        option.setName('opponent')
            .setDescription('Select someone to challenge'),
    );

export const execute = async interaction => {

    const { client } = interaction;
    const player = interaction.user;
    const opponent = interaction.options.getUser('opponent');

    if (!opponent) {
        await interaction.deferReply();
        return startGame(interaction);
    }

    if (opponent.bot && opponent.id == client.user.id)
        return interaction.reply({ content: `Oops, I'm busy right now! In the mean time, you can play with your ${spoiler('non-existent')} friends!`, ephemeral: true });

    if (opponent.bot && opponent.id != client.user.id)
        return interaction.reply({ content: `U-uh, you can't play with a bot... ${spoiler('except me :D')}`, ephemeral: true });

    if (opponent.id == player.id)
        return interaction.reply({ content: `U-uh, you can play ${inlineCode('/tictactoe')} without specifying someone if you don't have any friends, you know?`, ephemeral: true });

    sendChallenge(interaction, opponent);
};
