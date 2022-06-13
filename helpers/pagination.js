import { MessageActionRow, MessageButton } from 'discord.js';

import { log, logError } from '../helpers/logger.js';

const prevButtonId = 'previous';
const nextButtonId = 'next';
const infoButtonId = 'info';

export default async (interaction, pages, timeout = 120_000) => {

    const { client } = interaction;

    if (!interaction)
        throw new Error('interaction must not be null.');


    if (!pages)
        throw new Error('pages must not be null.');


    // There's no need to show all the pagination stuff if there's only one page.
    if (pages.length === 1) {
        const page = await interaction.editReply({
            embeds: pages,
            components: [],
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

    log(`Created paginated embed with ${pages.length} pages`);

    const collector = await currentPage.createMessageComponentCollector({ componentType: 'BUTTON', time: timeout });

    collector.on('collect', async i => {
        switch (i.customId) {
            case prevButtonId: {
                if (currentPageIndex > 0)
                    currentPageIndex--;

                break;
            }

            case nextButtonId: {
                if (currentPageIndex < pages.length - 1)
                    currentPageIndex++;


                break;
            }

            default: break;
        }

        if (currentPageIndex === 0)
            prevBtn.setDisabled(true);
        else if (prevBtn.disabled)
            prevBtn.setDisabled(false);


        if (currentPageIndex === pages.length - 1)
            nextBtn.setDisabled(true);
        else if (nextBtn.disabled)
            nextBtn.setDisabled(false);


        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[currentPageIndex].setFooter(getFooter())],
            components: [buttonRow],
        });

        // Reset timeout timer everytime a button is pressed.
        collector.resetTimer();
    });

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            // Limit the timeout string to show a maximum of 2 decimal places (in seconds).
            let timeoutStr = (timeout / 1000).toFixed(2);
            timeoutStr = Number.parseFloat(timeoutStr).toString();

            infoBtn.setLabel(`Expired after ${timeoutStr} seconds`);

            try {
                await currentPage.edit({
                    embeds: [pages[currentPageIndex].setFooter(getFooter())],
                    components: [buttonRow],
                });
            } catch (err) {
                // 10008: Unknown Message
                // The message has been deleted so we can just ignore it.
                if (err.code === 10008)
                    log(`Paginated embed with ${pages.length} pages was deleted.`);
                else
                    logError(err);


                return;
            }

            log(`Paginated embed with ${pages.length} pages expired after ${timeoutStr} seconds`);
        }
    });

    return currentPage;
};
