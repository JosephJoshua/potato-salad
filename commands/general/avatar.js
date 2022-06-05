const { SlashCommandBuilder } = require('@discordjs/builders');

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

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`Avatar - ${member.displayName}`)
            .setImage(member.displayAvatarURL({ size: 4096 }));

        await interaction.reply({ embeds: [embed] });
    },
};
