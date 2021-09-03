const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');

class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help', 'aide', 'h'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser la commande où vous avez besoin d\'aide') },
                        modifyRetry: () => { throw new EvalError('La commande que vous avez précisée n\'existe pas') },
						optional: true
					},
					match: 'rest'
				}
			],
			description: {
				content: 'Afficher la liste des commandes',
				usage: '[command]',
				examples: ['', 'say', 'tag']
			},
            category: 'utils'
        });
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {Command} args.command
     */
    async exec(message, args) {
        const { command } = args;

		if (!command) return this.execCommandList(message);
		if(command.ownerOnly && !this.client.ownerID.includes(message.author.id)) 
			throw new Error('La commande que vous avez précisée n\'existe pas');

        const description = Object.assign({
			content: 'Aucune description n\'est disponible',
			usage: '',
			examples: [],
			fields: []
        }, command.description);
        

		const embed = this.client.util.embed()
			.setColor(this.client.colors.green)
			.setTitle(`\`${this.client.commandHandler.prefix}${command.aliases[0]} ${description.usage}\``)
			.addField('Description', description.content)
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

		for (const field of description.fields) embed.addField(field.name, field.value);

		if (description.examples.length) {
			const text = `${this.client.commandHandler.prefix}${command.aliases[0]}`;
			embed.addField('Exemples', `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
		}

		if (command.aliases.length > 1) {
			embed.addField('Alias', `\`${command.aliases.join('` `')}\``, true);
		}

		if (command.userPermissions) {
			embed.addField('Permissions', `\`${command.userPermissions.join('` `')}\``, true);
		}

		if (command.clientPermissions) {
			embed.addField('Permissions du Bot', `\`${command.clientPermissions.join('` `')}\``, true);
		}

		if (command.contentParser.flagWords.length) {
			embed.addField('Flags', `\`${command.contentParser.flagWords.join('` `')}\``, true);
		}

		if (command.contentParser.optionFlagWords.length) {
			embed.addField('Flags options', `\`${command.contentParser.optionFlagWords.join('` `')}\``, true);
		}

		return message.util.send({ embed });
    }

	/**
	 * @param {Message} message 
	 */
    async execCommandList(message) {
		const embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setTitle('Liste des Commandes')
            .setThumbnail(this.client.user.avatarURL({format: 'png', size: 256, dynamic: true}))
            .setDescription([
                `Utiliser \`${this.client.commandHandler.prefix}\` avant chaque commande`,
                `Pour plus de détails sur une commande, utiliser \`${this.client.commandHandler.prefix}${this.id} <commande>\``
            ])
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

		for (const category of this.handler.categories.values()) {
            let title = this.client.categoryTitle[category.id];
			if (title) embed.addField(title, `\`${category.filter(cmd => !cmd.ownerOnly).map(cmd => cmd.aliases[0]).join('` `')}\``);
		}

		return message.util.send({ embed });
	}
}

module.exports = HelpCommand;