const { SlashCommandBuilder } = require('@discordjs/builders');
const { createCanvas } = require('canvas');
const { MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');

const CANVAS_SIZE = 400, CANVAS_PADDING = 16;
const BOARD_SIZE = 3;
const SECTION_SIZE = (CANVAS_SIZE - 2 * CANVAS_PADDING) / BOARD_SIZE;
const X_COLOR = '#FFCC66', O_COLOR = '#03DAC6';
const PLAYERS = Object.freeze({
    x: 'X', o: 'O',
});

const getPositionInCanvas = boardIndex => {
    return boardIndex * SECTION_SIZE + CANVAS_PADDING;
};

const drawBoardBackground = context => {
    context.globalCompositeOperation = 'destination-under';
    context.fillStyle = '#1e2124';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const drawBoardLines = context => {
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.strokeStyle = '#eee';

    context.beginPath();

    for (let i = 1; i < BOARD_SIZE; i++) {
        const y = getPositionInCanvas(i);

        context.moveTo(CANVAS_PADDING, y);
        context.lineTo(CANVAS_SIZE - CANVAS_PADDING, y);
    }

    for (let i = 1; i < BOARD_SIZE; i++) {
        const x = getPositionInCanvas(i);

        context.moveTo(x, CANVAS_PADDING);
        context.lineTo(x, CANVAS_SIZE - CANVAS_PADDING);
    }

    context.stroke();
};

const drawO = (context, x, y) => {
    const halfSectionSize = SECTION_SIZE / 2;
    const margin = 64;

    const centerX = x + halfSectionSize;
    const centerY = y + halfSectionSize;
    const radius = (SECTION_SIZE - margin) / 2;

    context.lineWidth = 8;
    context.strokeStyle = O_COLOR;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.stroke();
};

const drawX = (context, x, y) => {
    const margin = 40;

    context.lineCap = 'round';
    context.lineWidth = 8;
    context.strokeStyle = X_COLOR;

    context.beginPath();

    context.moveTo(x + margin, y + margin);
    context.lineTo(x + SECTION_SIZE - margin, y + SECTION_SIZE - margin);

    context.moveTo(x + margin, y + SECTION_SIZE - margin);
    context.lineTo(x + SECTION_SIZE - margin, y + margin);

    context.stroke();
};

const drawWinningLine = (context, winningLine) => {
    if (winningLine.length === 0) return;

    context.beginPath();

    winningLine.forEach(cell => {
        let offsetX = 0;
        let offsetY = 0;

        if (cell.x === 0) offsetX = -2;
        else if (cell.x === BOARD_SIZE - 1) offsetX = 2;

        if (cell.y === 0) offsetY = -2;
        else if (cell.y === BOARD_SIZE - 1) offsetY = 2;

        context.fillStyle = '#37474F';
        context.rect(getPositionInCanvas(cell.x) + offsetX, getPositionInCanvas(cell.y) + offsetY, SECTION_SIZE, SECTION_SIZE);
    });

    context.fill();
};

const getWinningLine = (board, lastTurn, turnCount) => {
    // You can't win a game before 4 moves.
    if (turnCount < 4) return;

    const winningLines = [
        // Horizontal 3-in-a-row.
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
        [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
        [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],

        // Vertical 3-in-a-row.
        [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
        [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
        [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],

        // Diagonal 3-in-a-row.
        [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
        [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
    ];

    const winningLine = winningLines.find(line => line.every(cell => board[cell.y][cell.x] === lastTurn));

    if (!winningLine) {
        // If every cell in the board has been occupied, it's a draw.
        if (board.every(row => row.every(cell => cell !== ''))) return [];

        return null;
    }

    return winningLine;
};

const generateBoardButtons = () => {
    return Array.from({ length: BOARD_SIZE }, (_v1, i) =>
        new MessageActionRow().setComponents(
            Array.from({ length: BOARD_SIZE }, (_v2, j) => new MessageButton()
                .setLabel('\u200b')
                .setCustomId((i * BOARD_SIZE + j).toString())
                .setStyle('SECONDARY'))));
};

const generateEmbedDescription = (turn, player, opponent) => {
    if (opponent === null) opponent = '???';

    const turnInfo = `It's ${turn === PLAYERS.x ? player : opponent}'s turn! Use the buttons below to make a move.`;
    const description = `**${player} (X) vs. ${opponent} (O)**\n\n${turnInfo}`;

    return description;
};

const generateBoardCanvas = (board, winningLine) => {
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const context = canvas.getContext('2d', { alpha: false });

    drawBoardBackground(context);
    drawWinningLine(context, winningLine);
    drawBoardLines(context);

    board.forEach((row, y) => row.forEach(
        (cell, x) => {
            if (cell === PLAYERS.x) drawX(context, getPositionInCanvas(x), getPositionInCanvas(y));
            else if (cell === PLAYERS.o) drawO(context, getPositionInCanvas(x), getPositionInCanvas(y));
        },
    ));

    return canvas;
};

const startGame = async (client, interaction, opponent = null) => {
    const board = [['', '', ''], ['', '', ''], ['', '', '']];
    const player = interaction.user;

    let turn = PLAYERS.x;

    const getCurrentPlayer = () => {
        return turn === PLAYERS.x ? player : opponent;
    };

    const actionRows = generateBoardButtons();

    const embed = new client.bot.embeds.DefaultEmbed(client)
        .setTitle('Tic-Tac-Toe')
        .setDescription(generateEmbedDescription(turn, player, opponent));

    const message = await interaction.editReply({
        embeds: [embed],
        components: actionRows,
        fetchReply: true,
    });

    const collector = await message.createMessageComponentCollector({ componentType: 'BUTTON', time: 120_000 });

    let turnCount = 0;
    let waitingForJoin = false; // If we're currently waiting for someone to join the game or not.

    let prevNotificationMsg = null;
    let notificationMsgTimeout = null;

    collector.on('collect', async i => {
        const choice = Number.parseInt(i.customId);

        if (isNaN(choice)) return;

        if (!waitingForJoin && i.user.id !== getCurrentPlayer().id) {
            await i.reply({ content: 'It\'s not currently your turn!', ephemeral: true });
            return;
        }

        if (waitingForJoin) {
            if (i.user.id === player.id) {
                await i.reply({ content: 'You have to wait for someone to join your game!', ephemeral: true });
                return;
            } else {
                waitingForJoin = false;
                opponent = i.user;
            }
        }

        if (prevNotificationMsg !== null) {
            try {
                await prevNotificationMsg.delete();
            } catch (err) {
                if (err.code != 10008) {
                    client.bot.logger.logError(err);
                }
            }
        }

        const targetX = choice % BOARD_SIZE;
        const targetY = Math.floor(choice / BOARD_SIZE);

        board[targetY][targetX] = turn;
        actionRows[targetY].components[targetX].setLabel(turn).setDisabled(true);

        const winningLine = getWinningLine(board, turn, turnCount);

        clearTimeout(notificationMsgTimeout);

        if (winningLine) {
            const moves = client.bot.formatter.pluralize(turnCount, 'move');

            const canvas = generateBoardCanvas(board, winningLine);
            const canvasFileName = 'tictactoe-result.png';
            const canvasAttachment = new MessageAttachment(canvas.toBuffer(), canvasFileName);

            const description = winningLine.length === 0 ? 'It was a tie!' : `${getCurrentPlayer()} won the game after a total of ${moves}!`;

            embed.setDescription(`**${player} (X) vs. ${opponent} (O)**\n\n${description}`)
                .setImage(`attachment://${canvasFileName}`);

            collector.stop('won');

            await i.deferUpdate();
            await i.editReply({
                embeds: [embed], components: [], files: [canvasAttachment],
            });

            return;
        }

        turn = turn === PLAYERS.x ? PLAYERS.o : PLAYERS.x;
        turnCount++;

        if (opponent === null) {
            // Runs once when the game is started without an opponent and the
            // player makes the first move.
            embed.setDescription(`**${player} (X) vs. ??? (O)**\n
                Waiting for someone to join the game...
                You can join the game by using the buttons below to make a move!`);

            waitingForJoin = true;
        } else {
            embed.setDescription(generateEmbedDescription(turn, player, opponent));
        }

        await i.deferUpdate();
        await i.editReply({
            embeds: [embed], components: actionRows,
        });

        if (opponent !== null) {
            notificationMsgTimeout = setTimeout(async () => {
                prevNotificationMsg = await interaction.followUp({
                    content: `${getCurrentPlayer()} It's your turn now!`,
                    fetchReply: true,
                });
            }, 15_000);
        }

        collector.resetTimer();
    });

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            const infoButton = new MessageButton()
                .setLabel('Expired after 120 seconds')
                .setCustomId('info')
                .setStyle('SECONDARY')
                .setDisabled(true);

            actionRows.forEach(row => row.components.forEach(button => button.setDisabled(true)));
            actionRows.push(new MessageActionRow().addComponents(infoButton));

            try {
                await message.edit({ components: actionRows });
            } catch (err) {
                // 10008: Unknown Message
                // The message has been deleted so we can just ignore it.
                if (err.code !== 10008) {
                    client.bot.logger.logError(err);
                }
            }
        }
    });
};

const sendChallenge = async (client, interaction, player, opponent) => {
    const embed = new client.bot.embeds.DefaultEmbed(client)
        .setTitle('Tic-Tac-Toe')
        .setDescription(`${opponent}, ${player} challenges you to a game of Tic-Tac-Toe!`);

    const infoButton = new MessageButton()
        .setLabel('Expires in 5 minutes')
        .setCustomId('info')
        .setStyle('SECONDARY')
        .setDisabled(true);

    const buttons = [
        new MessageButton()
            .setLabel('Accept')
            .setCustomId('accept')
            .setStyle('SUCCESS'),

        new MessageButton()
            .setLabel('Decline')
            .setCustomId('decline')
            .setStyle('DANGER'),

        infoButton,
    ];

    const actionRow = new MessageActionRow().addComponents(buttons);

    const message = await interaction.editReply({
        content: opponent.toString(),
        embeds: [embed],
        components: [actionRow],
        fetchReply: true,
    });

    const collector = await message.createMessageComponentCollector({ componentType: 'BUTTON', time: 300_000 });

    collector.on('collect', async i => {
        if (i.user.id === player.id) {
            await i.reply({ content: `You can't ${i.customId} your own challenge..`, ephemeral: true });
            return;
        }

        if (i.user.id !== opponent.id) {
            await i.reply({ content: 'You didn\'t get invited..', ephemeral: true });
            return;
        }

        switch (i.customId) {
        case 'accept': {
            collector.stop('accepted');

            await i.deferUpdate();
            await startGame(client, interaction, opponent);

            break;
        }

        case 'decline': {
            collector.stop('declined');

            infoButton.setLabel('Challenge was declined');
            buttons.forEach(button => button.setDisabled(true));

            await i.update({
                content: '\u200b',
                embeds: [embed],
                components: [actionRow],
            });

            break;
        }

        default: break;
        }
    });

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            infoButton.setLabel('Expired after 5 minutes');
            buttons.forEach(button => button.setDisabled(true));

            try {
                await message.edit({ components: [actionRow] });
            } catch (err) {
                // 10008: Unknown Message
                // The message has been deleted so we can just ignore it.
                if (err.code !== 10008) {
                    client.bot.logger.logError(err);
                }
            }
        }
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Challenge someone to a game of Tic-tac-toe!')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('Select someone to challenge'),
        ),

    async execute(interaction) {
        const { client } = interaction;

        const player = interaction.user;
        const opponent = interaction.options.getUser('opponent');

        if (opponent) {
            if (opponent.bot && opponent.id !== interaction.client.user.id) {
                await interaction.reply({
                    content: 'You unfortunately can\'t play with a bot.. ||except me :D||',
                    ephemeral: true,
                });

                return;
            }

            if (opponent.id === player.id) {
                await interaction.reply({
                    content: 'U-uh you can run `/tictactoe` without specifying someone to play with if you don\'t have any friends, you know?',
                    ephemeral: true,
                });

                return;
            }

            await interaction.deferReply();
            await sendChallenge(client, interaction, player, opponent);
        } else {
            await interaction.deferReply();
            await startGame(client, interaction, null);
        }
    },
};
