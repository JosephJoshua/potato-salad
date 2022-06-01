const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows the bot\'s ping'),

    async execute(interaction) {
        const { client } = interaction;

        const embed = new client.bot.embeds.DefaultEmbed(client).setTitle('Pong!');
        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

        const replyEmbed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle('Pong!')
            .showBotThumbnail()
            .addField('API', `${client.ws.ping}ms`)
            .addField('Latency', `${reply.createdTimestamp - interaction.createdTimestamp}ms`);

        await interaction.editReply({ embeds: [replyEmbed] });
    },
};
