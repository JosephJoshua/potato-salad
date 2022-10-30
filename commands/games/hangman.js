import nodeCanvas from 'canvas';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ComponentType, escapeItalic, SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';

import DefaultEmbed from '../../helpers/embeds.js';
import { formatDuration } from '../../helpers/formatter.js';

const CANVAS_WIDTH = 400, CANVAS_HEIGHT = 600;

const HOOK_X = 300, HOOK_Y = 100;
const BODY_LENGTH = 200, ARM_LENGTH = 65, LEG_LENGTH = 50;
const HEAD_RADIUS = 50;

const ARM_Y = HOOK_Y + HEAD_RADIUS * 2 + 50;
const LEG_START_Y = HOOK_Y + HEAD_RADIUS * 2 + BODY_LENGTH;

const ACTION_ROW_LIMIT = 5;

const WIN_COLOR = '#76FF03';
const LOSE_COLOR = '#F44336';

const WORDS = readFileSync('data/hangmanWords.txt').toString().split('\n');
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const drawLine = (ctx, startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
};

const drawPole = ctx => {

    const POLE_X = 100;
    const PADDING = 50;

    ctx.beginPath();

    // Draw hanging hook.
    ctx.moveTo(HOOK_X, HOOK_Y);
    ctx.lineTo(HOOK_X, HOOK_Y - PADDING);

    // Draw horizontal and vertical support.
    ctx.lineTo(POLE_X, PADDING);
    ctx.lineTo(POLE_X, CANVAS_HEIGHT - PADDING);

    // Draw base.
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(HOOK_X, CANVAS_HEIGHT - PADDING);

    ctx.stroke();
};

const drawHead = ctx => {
    ctx.beginPath();
    ctx.arc(HOOK_X, HOOK_Y + HEAD_RADIUS, HEAD_RADIUS, 0, 2 * Math.PI);
    ctx.stroke();
};

const drawBody = ctx => drawLine(ctx, HOOK_X, HOOK_Y + HEAD_RADIUS * 2, HOOK_X, LEG_START_Y);

const drawLeftLeg = ctx => drawLine(ctx, HOOK_X, LEG_START_Y, HOOK_X - LEG_LENGTH, LEG_START_Y + LEG_LENGTH);
const drawRightLeg = ctx => drawLine(ctx, HOOK_X, LEG_START_Y, HOOK_X + LEG_LENGTH, LEG_START_Y + LEG_LENGTH);

const drawLeftArm = ctx => drawLine(ctx, HOOK_X, ARM_Y, HOOK_X - ARM_LENGTH, ARM_Y);
const drawRightArm = ctx => drawLine(ctx, HOOK_X, ARM_Y, HOOK_X + ARM_LENGTH, ARM_Y);

const drawDeadFace = ctx => {

    const SPACING = 5;
    const EYE_MARGIN = 5;
    const MOUTH_MARGIN = 23;

    const drawX = (x, y) => {
        const margin = 8;

        ctx.moveTo(x + margin, y + margin);
        ctx.lineTo(x - margin, y - margin);

        ctx.moveTo(x + margin, y - margin);
        ctx.lineTo(x - margin, y + margin);
    };

    ctx.beginPath();

    // Draw eyes.
    drawX(HOOK_X - HEAD_RADIUS / 2 + SPACING, HOOK_Y + HEAD_RADIUS - EYE_MARGIN);
    drawX(HOOK_X + HEAD_RADIUS / 2 - SPACING, HOOK_Y + HEAD_RADIUS - EYE_MARGIN);

    // Draw mouth.
    ctx.moveTo(HOOK_X - HEAD_RADIUS / 2 + SPACING, HOOK_Y + HEAD_RADIUS + MOUTH_MARGIN);
    ctx.lineTo(HOOK_X + HEAD_RADIUS / 2 - SPACING, HOOK_Y + HEAD_RADIUS + MOUTH_MARGIN);

    ctx.stroke();
};

const generateAlphabetBtns = (exclude) => {

    const actionRows = [];
    const alphabet = ALPHABET.filter(c => c !== exclude);

    for (let i = 0; i < alphabet.length; i += ACTION_ROW_LIMIT) {
        const slice = alphabet.slice(i, i + ACTION_ROW_LIMIT);

        actionRows[i / ACTION_ROW_LIMIT] = new ActionRowBuilder()
            .setComponents(
                slice.map(char => new ButtonBuilder()
                    .setCustomId(char)
                    .setLabel(char.toUpperCase())
                    .setStyle('Secondary')));
    }

    return actionRows;
};

const generateAttachmentName = failedAttempts => `hangman-${failedAttempts}.png`;

const generateHangmanEmbed = (client, guess, failedAttempts) => {
    return new DefaultEmbed(client)
        .setTitle('Hangman')
        .addFields({ name: escapeItalic(guess.join(' ')), value: '\u200b' })
        .setImage(`attachment://${generateAttachmentName(failedAttempts)}`);
};

const randomFromArray = array => array[Math.floor(Math.random() * array.length)];

const startGame = async (interaction) => {

    await interaction.deferReply();

    const { client } = interaction;
    const collectorDuration = 300_000;

    const word = randomFromArray(WORDS).trimEnd().split('');
    const guess = word.map((c) => c === '-' ? c : '_'); // Reveal all dashes beforehand.

    const canvas = nodeCanvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    drawPole(ctx);

    let attachment = new AttachmentBuilder(canvas.toBuffer(), generateAttachmentName(0));

    const wordLower = word.join('').toLowerCase();
    const filteredAlphabet = ALPHABET.filter(c => !wordLower.includes(c));
    const actionRows = generateAlphabetBtns(randomFromArray(filteredAlphabet));

    const embed = generateHangmanEmbed(client, guess, 0);

    const collector = (await interaction.fetchReply()).createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: collectorDuration,
    });

    const drawFunctions = [drawHead, drawBody, drawLeftLeg, drawRightLeg, drawLeftArm, drawRightArm, drawDeadFace];

    let failedAttempts = 0;
    let finalButtonInteraction = null;

    collector.on('collect', i => {

        if (i.user.id !== interaction.user.id) {
            return i.reply({
                embeds: [new DefaultEmbed(client)
                    .setTitle('Hangman')
                    .setDescription('You\'re not the one who\'s playing!')],
                ephemeral: true,
            });
        }

        const correct = word.some(c => c.toLowerCase() === i.customId);

        actionRows.forEach(row => {
            row.components.find(btn => btn.customId === i.customId)
                ?.setDisabled(true)
                ?.setStyle(correct ? 'Primary' : 'Danger');
        });

        finalButtonInteraction = i;
        collector.resetTimer();

        if (correct) {

            word.forEach((char, j) => {
                if (char.toLowerCase() === i.customId) guess[j] = char;
            });

            if (guess.every(c => c !== '_')) return collector.stop('win');

            return i.update({
                embeds: [generateHangmanEmbed(client, guess, failedAttempts)],
                components: actionRows,
            });
        }

        drawFunctions[failedAttempts++](ctx);
        attachment = new AttachmentBuilder(canvas.toBuffer(), generateAttachmentName(failedAttempts));

        if (failedAttempts === drawFunctions.length) return collector.stop('lose');

        i.update({
            files: [attachment],
            embeds: [generateHangmanEmbed(client, guess, failedAttempts)],
            components: actionRows,
        });
    });

    collector.on('end', async (_, reason) => {

        actionRows.forEach(row => {
            row.components.forEach(button => {
                button.setDisabled(true);
            });
        });

        if (reason === 'time') {

            const message = `Expired after ${formatDuration(collectorDuration)}`;

            return interaction.editReply({
                content: message,
                embeds: [generateHangmanEmbed(client, guess, failedAttempts).setDefaultFooter(message)],
                components: actionRows,
            });
        }

        const message = reason === 'win'
            ? 'You guessed the word correctly! The man thanks you for sparing his life...'
            : `You couldn't guess the word... the man will now be hanged and die while you watch from afar, unable to do anything...\nBy the way, the word was ${word.join('')} :D`;

        finalButtonInteraction.update({
            files: [attachment],
            embeds: [generateHangmanEmbed(client, guess, failedAttempts)
                .setDescription(message)
                .setColor(reason === 'win' ? WIN_COLOR : LOSE_COLOR),
            ],
            components: actionRows,
        });
    });

    interaction.editReply({ embeds: [embed], components: actionRows, files: [attachment] });
};

export const data = new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play hangman!');

export const execute = interaction => startGame(interaction);
