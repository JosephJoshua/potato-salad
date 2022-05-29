const { MessageEmbed } = require('discord.js');

class DefaultEmbed extends MessageEmbed {
    constructor(client, { hideDefaultFooter = false } = {}) {
        super().setColor(client.bot.colors.primary).setTimestamp();

        this.client = client;

        if (!hideDefaultFooter) {
            this.setDefaultFooter();
        }
    }

    showBotThumbnail() {
        this.setThumbnail(this.client.user.displayAvatarURL());
        return this;
    }

    setDefaultFooter(txt = '') {
        this.setFooter(this.generateFooter(txt));
        return this;
    }

    generateFooter(txt = '') {
        let footerTxt = `v${this.client.bot.version}`;

        if (txt !== '') {
            footerTxt += ` | ${txt}`;
        }

        return { text: footerTxt, iconURL: this.client.user.displayAvatarURL() };
    }
}

module.exports = {
    DefaultEmbed,
};
