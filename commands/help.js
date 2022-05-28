const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const commandsPerPage = 10;

const optionsToString = (options) => {
    let optionStr = '';

    for (let i = 0; i < options.length; i++) {
        if (options[i].required) {
            optionStr += `[${options[i].name}]`;
        } else {
            optionStr += `(optional ${options[i].name})`;
        }
    }

    return optionStr;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides help on available commands.')

        // TODO: Maybe add autocomplete.
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Name of the command to get information on.'),
        ),

    async execute(interaction) {
        const bot = interaction.client.user;
        const commands = interaction.client.commands;

        const commandName = interaction.options.get('command')?.value;
        if (commandName !== undefined) {
            const command = commands.find(c => c.data.name === commandName);
            if (command === undefined) {
                const embed = new MessageEmbed()
                    .setTitle('Command Help')
                    .setDescription(`There's no command called "${commandName}"!\nYou can look at a list of all the commands using \`/help\``)
                    .setThumbnail(bot.avatarURL())
                    .setColor(interaction.client.colors.primary)
                    .setFooter({ text: bot.username, iconURL: bot.avatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const optionStr = optionsToString(command.data.options);
            const usageStr = `\`/${command.data.name}${optionStr != '' ? ' ' : ''}${optionStr}\``;

            const embed = new MessageEmbed()
                .setTitle('Command Help')
                .addField(`/${command.data.name}`, command.data.description)
                .addField('Usage', usageStr)
                .setThumbnail(bot.avatarURL())
                .setColor(interaction.client.colors.primary)
                .setFooter({ text: bot.username, iconURL: bot.avatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const pages = [];
        let pageIndex = 0;

        for (const val of commands.values()) {
            const optionStr = optionsToString(val.data.options);

            const fieldName = `/${val.data.name} ${optionStr}`;
            const fieldValue = val.data.description;

            // Create a new embed if it's a new page.
            if (pages[pageIndex] === undefined) {
                pages[pageIndex] = new MessageEmbed()
                    .setTitle(`Help | ${interaction.member.displayName}`)
                    .setDescription('Use `/help (command)` for help with a specific command.')
                    .setColor(interaction.client.colors.primary)
                    .addField(fieldName, fieldValue)
                    .setFooter({ text: bot.username, iconURL: bot.avatarURL() })
                    .setTimestamp();
            } else {
                pages[pageIndex].addField(fieldName, fieldValue);
            }

            // If we're past the max commands per page, move to the next page.
            if (pages[pageIndex].fields.length >= commandsPerPage) {
                pageIndex++;
            }
        }

        await interaction.client.pagination.paginatedEmbed(interaction, pages);
    },
};
