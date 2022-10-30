import { SlashCommandBuilder } from 'discord.js';

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
        .addFields([
            { name: 'Authors', value: authors.join('\n'), inline: true },
            { name: 'Bot Version', value: `v${client.bot.version}`, inline: true },
            { name: 'Bot ID', value: client.user.id, inline: true },
            { name: 'Library', value: 'discord.js', inline: true },
            { name: 'Library Version', value: client.bot.libraryVersion, inline: true },
            { name: 'Memory', value: `${formatMemory(heapUsed)}/${formatMemory(heapTotal)}`, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Uptime', value: formatDuration(client.uptime), inline: true },
            { name: 'Servers', value: pluralize(client.guilds.cache.size, 'server'), inline: true },
        ]);

    interaction.reply({ embeds: [embed] });
};
