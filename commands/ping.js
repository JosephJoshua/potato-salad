const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the server.'),
    async execute(interaction) {
        const reply = await interaction.reply({ content: 'Pong!', fetchReply: true });
        const latency = reply.createdTimestamp - interaction.createdTimestamp;
        const apiPing = interaction.client.ws.ping;
        const bot = interaction.client.user;

        const embed = new MessageEmbed()
            .setTitle('Pong!')
            .setColor(interaction.client.colors.primary)
            .setThumbnail(bot.avatarURL())
            .addField('Latency', `${latency}ms`, true)
            .addField('API Ping', `${apiPing}ms`, true)
            .setFooter({ text: bot.username, iconURL: bot.avatarURL() })
            .setTimestamp();

        await interaction.editReply({ content: '\u200b', embeds: [embed] });
    },
};
