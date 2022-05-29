const { SlashCommandBuilder } = require('@discordjs/builders');

const splitRolesToColumns = roles => {
    const roleCols = new Array('', '', '');
    const maxRowsPerCol = 30;

    let roleIndex = 0;

    for (const val of roles.values()) {
        const roleName = val.name;
        const colIndex = Math.floor(roleIndex / maxRowsPerCol);

        if (roleName === '@everyone') continue;

        if (roleIndex >= maxRowsPerCol * roleCols.length - 1) {
            const elipsis = '........';
            const lastCol = roleCols[roleCols.length - 1];

            roleCols[roleCols.length - 1] = lastCol + elipsis;
            break;
        }

        roleCols[colIndex] += roleName + '\n';
        roleIndex++;
    }

    return roleCols;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Shows a user\'s information')
        .addUserOption(option =>
            option.setName('username')
                .setDescription('Select a user'),
        ),

    async execute(interaction) {
        const { client } = interaction;
        const member = interaction.options.getMember('username') ?? interaction.member;

        const boostingSince = member.premiumSince ? client.bot.date.formatDate(member.premiumSince) : 'Not Boosting';
        const isInVoice = member.voice.channel ? 'Yes' : 'No';

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`User information - ${member.displayName}`)
            .setThumbnail(member.displayAvatarURL())
            .addField('Username', member.user.username, true)
            .addField('ID', member.id, true)
            .addField('Joined Server', client.bot.date.formatDate(member.joinedAt), true)
            .addField('Joined Discord', client.bot.date.formatDate(member.user.createdAt), true)
            .addField('Boosting Since', boostingSince, true)
            .addField('In Voice', isInVoice, true);

        const roles = member.roles.cache;
        const roleCols = splitRolesToColumns(roles);

        for (let i = 0; i < roleCols.length; i++) {
            if (i === 0) {
                embed.addField(`Roles (${roles.size - 1})`, roleCols[i], true);
            } else if (roleCols[i] !== '') {
                embed.addField('\u200b', roleCols[i], true);
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};
