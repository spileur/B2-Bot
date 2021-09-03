const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');

class PfCommand extends Command {
    constructor() {
        super('pf', {
            aliases: ['pf'],
            clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Obtenir un résultat aléatoire entre pile et face',
			},
            category: 'fun'
        });

        this.emojis = {
            coinLauch: '710986152085159966'
        }
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     */
    async exec(message) {
        const embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setDescription('**Lancement de la pièce...** '+this.client.emojis.cache.get(this.emojis.coinLauch).toString())
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        await message.util.send(embed);

        const random = this.getRandomInt(0, 2);

        setTimeout(() => {
            embed.setDescription((random > 0 ? '**Pile** ' : '**Face** ') + this.client.emojis.cache.get(this.emojis.coinLauch).toString()); 
            message.util.send(embed);
        }, 2000);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports = PfCommand;