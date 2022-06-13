import { SlashCommandBuilder } from '@discordjs/builders';

import DefaultEmbed from '../../helpers/embeds.js';
import { formatDuration, formatMemory, pluralize } from '../../helpers/formatter.js';

export const data = new SlashCommandBuilder()
    .setName('bot')
    .setDescription('Shows the bot\'s information');

export const execute = async interaction => {

    const { client } = interaction;

    const authors = await Promise.all(client.bot.authors
        .map(async id => (await client.users.fetch(id)).tag));

    const { heapUsed, heapTotal } = process.memoryUsage();

    const embed = new DefaultEmbed(client)
        .setTitle(`Bot information - ${client.user.username}`)
        .setBotThumbnail()
        .addField('Authors', authors.join('\n'), true)
        .addField('Bot Version', `v${client.bot.version}`, true)
        .addField('Bot ID', client.user.id, true)
        .addField('Library', 'discord.js', true)
        .addField('Library Version', client.bot.libraryVersion, true)
        .addField('Memory', `${formatMemory(heapUsed)}/${formatMemory(heapTotal)}`, true)
        .addField('Ping', `${client.ws.ping}ms`, true)
        .addField('Uptime', formatDuration(client.uptime), true)
        .addField('Servers', pluralize(client.guilds.cache.size, 'server'), true);

    interaction.reply({ embeds: [embed] });
};
