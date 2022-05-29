const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Shows a user\'s avatar')
        .addUserOption(option =>
            option.setName('username')
                .setDescription('Select a user'),
        ),

    async execute(interaction) {
        const { client } = interaction;
        const member = interaction.options.getMember('username') ?? interaction.member;

        const embed = new MessageEmbed()
            .setColor(client.bot.colors.primary)
            .setTitle(`Avatar - ${member.displayName}`)
            .setImage(member.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: `v${client.bot.version}`, iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
