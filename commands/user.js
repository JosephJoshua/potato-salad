const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const formatDate = (date) => {
    return date.toISOString().replace(/T/, ' ').replace(/\..*/, '');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Shows a server member\'s information.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member.')
                .setRequired(true),
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);
        const boostingSince = member.premiumSince ? formatDate(member.premiumSince) : 'Not Boosting';
        const isInVoice = member.voice.channel ? 'Yes' : 'No';
        const footer = `Requested by ${interaction.user.tag} | ${interaction.user.id}`;

        let roleStr = '';
        let roleCount = 0;

        member.roles.cache.forEach(val => {
            if (val.name === '@everyone') return;

            roleStr += val.name + '\n';
            roleCount++;
        });

        const embed = new MessageEmbed()
            .setTitle(user.tag)
            .setColor('#FFCC66')
            .setThumbnail(user.avatarURL())
            .addField('ID', user.id, true)
            .addField('Joined Server', formatDate(member.joinedAt), true)
            .addField('Joined Discord', formatDate(user.createdAt), true)
            .addField(`Roles (${roleCount})`, roleStr, true)
            .addField('Boosting Since', boostingSince, true)
            .addField('In Voice', isInVoice, true)
            .setFooter({ text: footer });

        await interaction.reply({ embeds: [embed] });
    },
};
