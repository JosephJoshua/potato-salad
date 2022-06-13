import { bold, inlineCode, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';

import DefaultEmbed from '../../helpers/embeds.js';
import paginatedEmbed from '../../helpers/pagination.js';

const COMMANDS_PER_PAGE = 10;

let autocompleteCommands = null;
let autocompleteCategories = null;

let allCmdsWithSubcmds = null;

const toTitleCase = str => {
    return str.replace(
        /\w\S*/g,
        function(word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        },
    );
};

const optionsToString = options => {

    return options.map(option => {
        if (option.required)
            return `[${option.name}]`;
        else
            return `(${option.name})`;

    }).join(' ');
};

const getWithSubcommands = commands => {

    let allCommands = [];

    const isSubcommand = option => {
        return option instanceof SlashCommandSubcommandBuilder;
    };

    for (const command of commands.values()) {
        const subcommands = command.data.options.filter(option => isSubcommand(option));

        allCommands = allCommands.concat(subcommands.length ? [] : command,
            subcommands.map(subcommand => {
                return {
                    data: { ...subcommand, name: `${command.data.name} ${subcommand.name}` },
                };
            }));
    }

    return allCommands;
};

const getAllCmdsWithSubcmds = client => {

    if (allCmdsWithSubcmds !== null) return allCmdsWithSubcmds;

    allCmdsWithSubcmds = getWithSubcommands(client.bot.commands);
    return allCmdsWithSubcmds;
};

const generateUnknownCommandEmbed = (client, commandName) => {
    return new DefaultEmbed(client)
        .setTitle('Command help')
        .setDescription(`There's no command called "${commandName}"!
            You can look at a list of all the commands using ${inlineCode('/help all')}`)
        .setBotThumbnail();
};

const generateCommandHelpEmbed = (client, command) => {

    const optionStr = optionsToString(command.data.options);

    // Remove any trailing spaces in case there weren't any options.
    const usageStr = inlineCode(`/${command.data.name} ${optionStr}`.trimEnd());

    return new DefaultEmbed(client)
        .setTitle('Command help')
        .setBotThumbnail()
        .addField(`/${command.data.name}`, command.data.description)
        .addField('Usage', usageStr);
};

const generateCommandPageEmbed = (client, category = '') => {

    const categoryText = (category === '' ? '' : '| ') + category;

    return new DefaultEmbed(client)
        .setTitle(`Command help ${categoryText}`)
        .setDescription(`Use ${inlineCode('/help command (command)')} for help with a specific command`);
};

const generateCommandPages = (client, commands, category = '') => {

    const pages = [];
    let pageIndex = 0;

    for (const command of getWithSubcommands(commands)) {
        const optionStr = optionsToString(command.data.options);

        const fieldName = `/${command.data.name} ${optionStr}`;
        const fieldValue = command.data.description;

        // Create a new embed if it's a new page.
        if (pages[pageIndex] === undefined)
            pages[pageIndex] = generateCommandPageEmbed(client, category);

        // Add the command as a field in the embed.
        pages[pageIndex].addField(fieldName, fieldValue);

        // If we're past the max commands per page, move to the next page.
        if (pages[pageIndex].fields.length >= COMMANDS_PER_PAGE)
            pageIndex++;
    }

    // Add notes to the last field of every page.
    const notes = '\n\n' + bold('() = optional | [] = required');
    pages.forEach(page => {
        page.fields[page.fields.length - 1].value += notes;
    });

    return pages;
};

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Provides help on available commands')
    .addSubcommand(subcommand =>
        subcommand.setName('category')
            .setDescription('Get all the commands in a category')
            .addStringOption(option =>
                option.setName('category')
                    .setDescription('Name of the category')
                    .setAutocomplete(true)
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand.setName('command')
            .setDescription('Get information about a specific command')
            .addStringOption(option =>
                option.setName('command')
                    .setDescription('Name of the command to get information on')
                    .setAutocomplete(true)
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand.setName('all')
            .setDescription('Shows all available commands'));

export const execute = async interaction => {

    const { client } = interaction;
    const subcommand = interaction.options.getSubcommand();

    // Handle category command help (/help category [category]).
    if (subcommand === 'category') {
        const category = interaction.options.getString('category', true);
        const categoryCommands = client.bot.commands.filter(command => command.category === category);

        const pages = generateCommandPages(client, categoryCommands, toTitleCase(category));

        await interaction.deferReply();
        await paginatedEmbed(interaction, pages);

        return;
    }

    // Handle single command help [/help (command)].
    if (subcommand === 'command') {
        const commandName = interaction.options.getString('command', true);
        const command = getAllCmdsWithSubcmds(client).find(c => c.data.name === commandName);

        if (command === undefined) {
            const embed = generateUnknownCommandEmbed(client, commandName);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const embed = generateCommandHelpEmbed(client, command);
            await interaction.reply({ embeds: [embed] });
        }

        return;
    }

    // Handle command list help (/help all).
    if (subcommand === 'all') {
        await interaction.deferReply();
        await paginatedEmbed(
            interaction,
            generateCommandPages(client, client.bot.commands),
        );
    }
};

export const handleAutocomplete = async interaction => {

    const { client } = interaction;

    const focusedOption = interaction.options.getFocused(true);
    const query = focusedOption.value.trim().toLowerCase();

    let suggestions = null;

    if (focusedOption.name === 'command') {
        if (autocompleteCommands === null) {
            autocompleteCommands = getAllCmdsWithSubcmds(client)
                .map(command => {
                    return {
                        name: `/${command.data.name}`, value: command.data.name,
                    };
                });
        }

        suggestions = autocompleteCommands;

    } else if (focusedOption.name === 'category') {
        if (autocompleteCategories === null) {
            autocompleteCategories = Array.from(new Set(client.bot.commands.map(command => command.category))).map(
                category => {
                    return {
                        name: toTitleCase(category), value: category,
                    };
                },
            );
        }

        suggestions = autocompleteCategories;
    }

    // We only want to filter the list if the user has typed something.
    if (query !== '')
        suggestions = suggestions.filter(suggestion => suggestion.name.toLowerCase().includes(query));

    // Sort suggestions alphabetically.
    suggestions = suggestions.sort((a, b) => a.name.localeCompare(b.name));
    await interaction.respond(suggestions);
};
