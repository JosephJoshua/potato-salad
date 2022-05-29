const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Shows the bot\'s information'),

    async execute(interaction) {
        const { client } = interaction;
        const formatter = client.bot.formatter;

        const authors = await Promise.all([
            '694499855174992032',
            '217518123606081536',
        ].map(id => client.users.fetch(id)));

        const memoryUsed = formatter.formatMemory(process.memoryUsage().heapUsed);
        const memoryTotal = formatter.formatMemory(process.memoryUsage().heapTotal);

        const guildCount = formatter.pluralize(client.guilds.cache.size, 'server');
        const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`Bot information - ${client.user.username}`)
            .showBotThumbnail()
            .addField('Authors', authors.join('\n'), true)
            .addField('Bot Version', `v${client.bot.version}`, true)
            .addField('Bot ID', client.user.id, true)
            .addField('Library', 'discord.js', true)
            .addField('Library Version', require('discord.js').version, true)
            .addField('Memory', `${memoryUsed}/${memoryTotal}`, true)
            .addField('Ping', `${client.ws.ping}ms`, true)
            .addField('Uptime', `${formatter.formatDuration(client.uptime)}`, true)
            .addField('Servers', `${guildCount} with ${formatter.pluralize(memberCount, 'member')}`, true);

        await interaction.reply({ embeds: [embed] });
    },
};
