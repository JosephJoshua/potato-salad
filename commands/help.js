const { SlashCommandBuilder } = require('@discordjs/builders');

const commandsPerPage = 10;

const optionsToString = options => {
    return options.map(option => {
        if (option.required) {
            return `[${option.name}]`;
        } else {
            return `(${option.name})`;
        }
    }).join(' ');
};

const generateUnknownCommandEmbed = (client, commandName) => {
    return new client.bot.embeds.DefaultEmbed(client)
        .setTitle('Command help')
        .setDescription(`There's no command called "${commandName}"!\nYou can look at a list of all the commands using \`/help\``)
        .showBotThumbnail();
};

const generateCommandHelpEmbed = (client, command) => {
    const optionStr = optionsToString(command.data.options);

    // Remove any trailing spaces in case there weren't any options.
    const usageStr = `\`/${command.data.name} ${optionStr}`.trimEnd() + '`';

    return new client.bot.embeds.DefaultEmbed(client)
        .setTitle('Command help')
        .showBotThumbnail()
        .addField(`/${command.data.name}`, command.data.description)
        .addField('Usage', usageStr);
};

const generateCommandPageEmbed = (client, memberName) => {
    return new client.bot.embeds.DefaultEmbed(client)
        .setTitle(`Help | ${memberName}`)
        .setDescription('Use `/help (command)` for help with a specific command.');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides help on available commands')

        // TODO: Maybe add autocomplete.
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Name of the command to get information on.'),
        ),

    async execute(interaction) {
        const { client } = interaction;
        const commands = client.bot.commands;

        // Handle single command help [/help (command)].
        const commandName = interaction.options.get('command')?.value;
        if (commandName !== undefined) {

            const command = commands.find(c => c.data.name === commandName);
            if (command === undefined) {
                const embed = generateUnknownCommandEmbed(client, commandName);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = generateCommandHelpEmbed(client, command);
                await interaction.reply({ embeds: [embed] });
            }

            return;
        }

        // Handle command list (/help).
        const pages = [];
        let pageIndex = 0;

        for (const val of commands.values()) {
            const optionStr = optionsToString(val.data.options);

            const fieldName = `/${val.data.name} ${optionStr}`;
            const fieldValue = val.data.description;

            // Create a new embed if it's a new page.
            if (pages[pageIndex] === undefined) {
                pages[pageIndex] = generateCommandPageEmbed(client, interaction.member.displayName);
            }

            // Add the command as a field in the embed.
            pages[pageIndex].addField(fieldName, fieldValue);

            // If we're past the max commands per page, move to the next page.
            if (pages[pageIndex].fields.length >= commandsPerPage) {
                pageIndex++;
            }
        }

        // Add notes to the last field of every page.
        const notes = '\n\n**() = optional | [] = required**';
        pages.forEach(page => {
            page.fields[page.fields.length - 1].value += notes;
        });

        await client.bot.pagination.paginatedEmbed(interaction, pages);
    },
};
