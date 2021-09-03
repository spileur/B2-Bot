const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const fetch = require('node-fetch');


class JokeCommand extends Command {
    constructor() {
        super('joke', {
            aliases: ['joke', 'blague'],
            clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Générer une blague',
			},
            category: 'fun'
        });

        this.emojis = {
            loading : '711928319473483977'
        }
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     */
    async exec(message) {
        const embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setTitle("Blague")
            .setDescription(this.client.emojis.cache.get(this.emojis.loading).toString() + ' **Recherche une blague drôle...**')
            .setFooter(this.client.commandHandler.prefix+this.id + " | blagues-api.fr", this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        const data = await fetch('https://www.blagues-api.fr/api/random?disallow=dark', {
            method : 'get',
            headers: {
                'Authorization': `Bearer ${process.env.JOKE_TOKEN}`,
                'Content-Type' : 'application/json'
            }
        }).then(response => response.json());

        embed.setDescription("**" + data.joke + "**");
        await message.util.send(embed);

        setTimeout(() => {
            embed.setDescription("**" + data.joke + "**" + ((data.answer) ? "\n" + data.answer : ""));
            return message.util.send(embed);
        }, 2000);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports = JokeCommand;
