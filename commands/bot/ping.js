const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'],
            clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Connaitre le ping du bot',
			},
            category: 'bot'
        });
    }

    /**
     * @param {d.Message} message
     * @param {Object} args
     * @param {CommandUtil} message.util
     */
    async exec(message) {
        const embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setTitle('Pong  :ping_pong:')
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        const send = await message.util.send(embed);
        
        const timeDiff = (send.editedAt || send.createdAt) - (message.editedAt || message.createdAt);
        embed.addField('Latence du Bot', timeDiff + ' ms', true);
        embed.addField('Latence de l\'API', this.client.ws.ping + ' ms', true);

        return message.util.send(embed);
    }
}

module.exports = PingCommand;