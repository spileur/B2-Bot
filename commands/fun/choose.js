const { Command, CommandUtil} = require('discord-akairo');
const d = require('discord.js');

class ChooseCommand extends Command {
    constructor() {
        super('choose', {
            aliases: ['choose', 'choisir'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
				{
					id: 'choices',
					match: 'content',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser des choix séparés avec `/`') },
                        modifyRetry: () => { throw new EvalError('Préciser des choix séparés avec `/`') },
                        optional: false
					}
				}
			],
			description: {
				content: 'Obtenir un résultat aléatoire entre tous les choix proposés',
				usage: '<choix>',
				examples: ['Oui/Non', 'Pour/Mitigé/Contre']
			},
            category: 'fun'
        });

        this.emojis = {
            reactionResult: ['710991762147115008', '710991768614862871', '710991766433693776', '710991767578607627', '710998497574387712',
                             '804654283953274920']
        }
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {String} args.choices
     */
    async exec(message, args) {

        const embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setDescription('**Je réfléchis...**  🤔')
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        await message.util.send(embed);

        const choices = args.choices.split('/');
        const random = this.getRandomInt(0, choices.length);
        const ramdomEmoji = this.getRandomInt(0, this.emojis.reactionResult.length);

        setTimeout(() => {
            embed.setDescription('**Mon choix est **`' + d.Util.escapeMarkdown(choices[random])+'` ' + 
                this.client.emojis.cache.get(this.emojis.reactionResult[ramdomEmoji]).toString());
            message.util.send(embed);
        }, 2000);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}


module.exports = ChooseCommand;
