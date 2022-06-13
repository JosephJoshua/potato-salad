import { MessageEmbed } from 'discord.js';

import { primary } from './colors.js';

export default class DefaultEmbed extends MessageEmbed {

    constructor(client, setDefaultFooter = true) {

        super().setColor(primary).setTimestamp();
        this.client = client;

        if (setDefaultFooter) this.setDefaultFooter();
    }

    setBotThumbnail() {
        return this.setThumbnail(this.client.user.displayAvatarURL());
    }

    setDefaultFooter(text = '') {

        let footerText = `v${this.client.bot.version}`;

        if (text !== '') footerText += ` | ${text}`;

        return this.setFooter({ text: footerText, iconURL: this.client.user.displayAvatarURL() });
    }
}
