const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

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
        .setDescription('Shows a server member\'s information.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member.')
                .setRequired(true),
        ),

    async execute(interaction) {
        const dateHelper = interaction.client.date;
        const user = interaction.options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);
        const boostingSince = member.premiumSince ? dateHelper.formatDate(member.premiumSince) : 'Not Boosting';
        const isInVoice = member.voice.channel ? 'Yes' : 'No';
        const bot = interaction.client.user;

        const embed = new MessageEmbed()
            .setTitle(member.displayName)
            .setColor(interaction.client.colors.primary)
            .setThumbnail(user.avatarURL())
            .addField('Username', user.username, true)
            .addField('ID', user.id, true)
            .addField('Joined Server', dateHelper.formatDate(member.joinedAt), true)
            .addField('Joined Discord', dateHelper.formatDate(user.createdAt), true)
            .addField('Boosting Since', boostingSince, true)
            .addField('In Voice', isInVoice, true);

        const roles = member.roles.cache;
        const roleCols = splitRolesToColumns(roles);

        for (let i = 0; i < roleCols.length; i++) {
            if (i === 0) {
                embed.addField(`Roles (${roles.size - 1})`, roleCols[i], true);
            } else if (roleCols[i] !== '') {
                embed.addField('', roleCols[i], true);
            }
        }

        embed.setFooter({ text: bot.username, iconURL: bot.avatarURL() }).setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
