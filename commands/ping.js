const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the server'),

    async execute(interaction) {
        const { client } = interaction;

        const embed = new MessageEmbed()
            .setColor(client.bot.colors.primary)
            .setTitle('Pong!')
            .setTimestamp()
            .setFooter({ text: `v${client.bot.version}`, iconURL: client.user.displayAvatarURL() });

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

        const replyEmbed = new MessageEmbed()
            .setColor(client.bot.colors.primary)
            .setTitle('Pong!')
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: `v${client.bot.version}`, iconURL: client.user.displayAvatarURL() })
            .addField('API', `${client.ws.ping}ms`)
            .addField('Latency', `${reply.createdTimestamp - interaction.createdTimestamp}ms`);

        await interaction.editReply({ embeds: [replyEmbed] });
    },
};
