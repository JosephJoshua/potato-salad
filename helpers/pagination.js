const { MessageButton, MessageActionRow } = require('discord.js');

const prevButtonId = 'previous';
const nextButtonId = 'next';
const infoButtonId = 'info';

const paginatedEmbed = async (interaction, pages, timeout = 120_000) => {

    const { client } = interaction;

    if (!interaction) {
        throw new Error('interaction must not be null.');
    }

    if (!pages) {
        throw new Error('pages must not be null.');
    }

    if (!interaction.deferred) {
        await interaction.deferReply();
    }

    // There's no need to show all the pagination stuff if there's only one page.
    if (pages.length === 1) {
        const page = await interaction.editReply({
            embeds: pages,
            fetchReply: true,
        });

        return page;
    }

    const prevBtn = new MessageButton()
        .setCustomId(prevButtonId)
        .setLabel('<')
        .setStyle('SECONDARY')
        .setDisabled(true);

    const nextBtn = new MessageButton()
        .setCustomId(nextButtonId)
        .setLabel('>')
        .setStyle('SECONDARY');

    const infoBtn = new MessageButton()
        .setCustomId(infoButtonId)
        .setLabel(`Requested by ${interaction.user.tag}`)
        .setStyle('SECONDARY')
        .setDisabled(true);

    const buttonRow = new MessageActionRow().addComponents(prevBtn, nextBtn, infoBtn);
    let currentPageIndex = 0;

    const getFooter = () => {
        return {
            text: `v${client.bot.version} | Page ${currentPageIndex + 1} of ${pages.length}`,
            iconURL: client.user.displayAvatarURL(),
        };
    };

    // Load the first page.
    const currentPage = await interaction.editReply({
        embeds: [pages[currentPageIndex].setFooter(getFooter())],
        components: [buttonRow],
        fetchReply: true,
    });

    client.bot.logger.log(`Created paginated embed with ${pages.length} pages.`);

    const collector = await currentPage.createMessageComponentCollector({ componentType: 'BUTTON', time: timeout });

    collector.on('collect', async i => {
        switch (i.customId) {
        case prevButtonId: {
            if (currentPageIndex > 0) {
                currentPageIndex--;
            }

            break;
        }

        case nextButtonId: {
            if (currentPageIndex < pages.length - 1) {
                currentPageIndex++;
            }

            break;
        }

        default: break;
        }

        if (currentPageIndex === 0) {
            prevBtn.setDisabled(true);
        } else if (prevBtn.disabled) {
            prevBtn.setDisabled(false);
        }

        if (currentPageIndex === pages.length - 1) {
            nextBtn.setDisabled(true);
        } else if (nextBtn.disabled) {
            nextBtn.setDisabled(false);
        }

        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[currentPageIndex].setFooter(getFooter())],
            components: [buttonRow],
        });

        // Reset timeout timer everytime a button is pressed.
        collector.resetTimer();
    });

    collector.on('end', (_, reason) => {
        if (reason !== 'messageDelete') {
            // Limit timeout time to be a maximum of 2 decimal places.
            let timeoutStr = (timeout / 1000).toFixed(2);
            let i = timeoutStr.length - 1;

            // Remove all trailing zeroes and '.'
            while (timeoutStr[i] === '0' || timeoutStr[i] === '.') {
                i--;
            }

            timeoutStr = timeoutStr.substring(0, i + 1);
            infoBtn.setLabel(`Expired after ${timeoutStr} seconds`);

            try {
                currentPage.edit({
                    embeds: [pages[currentPageIndex].setFooter(getFooter())],
                    components: [buttonRow],
                });

            // Discord will throw an error if the message was deleted and
            // we try to edit it and the message.deleted property has been deprecated.
            // eslint-disable-next-line no-empty
            } catch (err) {}

            client.bot.logger.log(`Paginated embed with ${pages.length} pages expired after ${timeoutStr} seconds.`);
        }
    });

    return currentPage;
};

module.exports = {
    paginatedEmbed,
};
