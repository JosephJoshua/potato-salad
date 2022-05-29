const { MessageEmbed } = require('discord.js');

class DefaultEmbed extends MessageEmbed {
    constructor(client, setDefaultFooter = true) {
        super()
            .setColor(client.bot.colors.primary)
            .setTimestamp();

        this.client = client;

        if (setDefaultFooter) this.setDefaultFooter();
    }

    showBotThumbnail() {
        return this.setThumbnail(this.client.user.displayAvatarURL());
    }

    setDefaultFooter(text = '') {
        let footerText = `v${this.client.bot.version}`;

        if (text !== '') footerText += ` | ${text}`;

        return this.setFooter({ text: footerText, iconURL: this.client.user.displayAvatarURL() });
    }
}

module.exports = {
    DefaultEmbed,
};
