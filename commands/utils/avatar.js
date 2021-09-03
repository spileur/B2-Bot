const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const { DateTime } = require('luxon');

class AvatarCommand extends Command {
    constructor() {
        super('avatar', {
            aliases: ['avatar', 'icon'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser un membre') },
                        modifyRetry: () => { throw new EvalError('Le membre que vous avez précisée est introuvable') },
						optional: true
					},
					default: message => message.member
				}
			],
			description: {
				content: 'Afficher l\'avatar d\'un membre',
				usage: '[membre]',
				examples: ['', 'Spileur', '505009345633976331']
			},
            category: 'utils'
        });
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {d.GuildMember} args.member
     */
    async exec(message, args) {
        const member = args.member;

        const embed = this.client.util.embed()
            .setColor((member.roles && member.roles.color) ? member.displayHexColor : this.client.colors.gray)
            .setTitle("Avatar de **" + d.Util.escapeMarkdown(member.user.tag) + "**")
            .setImage(member.user.displayAvatarURL({format: 'png', size: 1024, dynamic: true}))
            .setFooter(this.client.commandHandler.prefix + this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        return message.util.send(embed);
    }
}

module.exports = AvatarCommand;