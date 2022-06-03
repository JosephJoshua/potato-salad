const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Shows the bot\'s information'),

    async execute(interaction) {
        const { client } = interaction;
        const { formatDuration, formatMemory, pluralize } = client.bot.formatter;

        const authors = await Promise.all([
            '694499855174992032',
            '217518123606081536',
        ].map(async id => (await client.users.fetch(id)).tag));

        const { heapUsed, heapTotal } = process.memoryUsage();

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`Bot information - ${client.user.username}`)
            .showBotThumbnail()
            .addField('Authors', authors.join('\n'), true)
            .addField('Bot Version', `v${client.bot.version}`, true)
            .addField('Bot ID', client.user.id, true)
            .addField('Library', 'discord.js', true)
            .addField('Library Version', require('discord.js').version, true)
            .addField('Memory', `${formatMemory(heapUsed)}/${formatMemory(heapTotal)}`, true)
            .addField('Ping', `${client.ws.ping}ms`, true)
            .addField('Uptime', formatDuration(client.uptime), true)
            .addField('Servers', pluralize(client.guilds.cache.size, 'server'), true);

        await interaction.reply({ embeds: [embed] });
    },
};
