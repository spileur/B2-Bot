const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const { DateTime } = require('luxon');

class UserInfoCommand extends Command {
    constructor() {
        super('uinfo', {
            aliases: ['uinfo', 'ui'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser un membre') },
                        modifyRetry: () => { throw new EvalError('Le membre est introuvable') },
						optional: true
					},
					default: message => message.member
				}
			],
			description: {
				content: 'Afficher les informations sur un membre',
				usage: '[membre]',
				examples: ['', 'Spileur', '505009345633976331']
			},
            category: 'utils',
            channel: 'guild'
        });

        this.emojis = {
            desktop: {
                online: '710867251099598969',
                idle: '710867251007324270',
                dnd: '710867250441224213'
            },
            mobile: {
                online: '710867250931826749',
                idle: '710867250713853974',
                dnd: '710867250680430663'
            },
            web: {
                online: '710867254652305509',
                idle: '710867254509699142',
                dnd: '710867251041009707'
            },
            offline: '710867250919505961',
            nitro: '710883550622253167'
        }
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
            .setColor((member.roles.color) ? member.displayHexColor : this.client.colors.gray)
            .setTitle('__' + d.Util.escapeMarkdown((member.nickname) ? member.nickname : member.user.username) + '__')
            .setDescription(this.getCustomStats(member.presence))

            .addField('Pseudo', d.Util.escapeMarkdown(member.user.tag), true)
            .addField('Surnom', (member.nickname) ? d.Util.escapeMarkdown(member.nickname) : '*Aucun*', true)
            .addField('Status', this.getStatusEmoji(member.presence), true)
            .addField('ID', member.user.id, true)  
            .addField('Date d\'arrivée', DateTime.fromJSDate(member.joinedAt).setLocale('fr').toFormat("dd'/'LL'/'yyyy'\nà' HH'h'mm"), true)
            .addField('Création du compte', DateTime.fromJSDate(member.user.createdAt).setLocale('fr').toFormat("dd'/'LL'/'yyyy'\nà' HH'h'mm"), true)
            .addField('Role(s)', (member.roles.cache.size > 1) ? member.roles.cache.filter(role => role.name !== '@everyone').array().join(', ') : '*Aucun*', true)

            .setThumbnail(member.user.displayAvatarURL({format: 'png', size: 256, dynamic: true}))
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        return message.util.send(embed);
    }

    /**
     * Getting emoji that matches with status presence
     * @param {d.Presence} presence
     */
    getStatusEmoji(presence){
        if(!presence.clientStatus){
            return this.client.emojis.cache.get(this.emojis.offline);
        }
        if(presence.clientStatus.desktop){
            if(presence.status === 'online'){
                return this.client.emojis.cache.get(this.emojis.desktop.online);
            }else if(presence.status === 'idle'){
                return this.client.emojis.cache.get(this.emojis.desktop.idle);
            }else if(presence.status === 'dnd'){
                return this.client.emojis.cache.get(this.emojis.desktop.dnd);
            }
        }else if(presence.clientStatus.web){
            if(presence.status === 'online'){
                return this.client.emojis.cache.get(this.emojis.web.online);
            }else if(presence.status === 'idle'){
                return this.client.emojis.cache.get(this.emojis.web.idle);
            }else if(presence.status === 'dnd'){
                return this.client.emojis.cache.get(this.emojis.web.dnd);
            }
        }else if(presence.clientStatus.mobile){
            if(presence.status === 'online'){
                return this.client.emojis.cache.get(this.emojis.mobile.online);
            }else if(presence.status === 'idle'){
                return this.client.emojis.cache.get(this.emojis.mobile.idle);
            }else if(presence.status === 'dnd'){
                return this.client.emojis.cache.get(this.emojis.mobile.dnd);
            }
        }
        return this.client.emojis.cache.get(this.emojis.offline);
    }

    /**
     * Getting and Formatting custom status presence
     * @param {d.Presence} presence
     */
    getCustomStats(presence){
        const customStatus = presence.activities.find(activity => activity.type == 'CUSTOM_STATUS');
        const gameStatus = presence.activities.find(activity => activity.type == 'PLAYING');
        let resultDescription = '';
        if(customStatus){
            resultDescription += ((customStatus.emoji) ? customStatus.emoji.toString() : '') + ((customStatus.state) ? ' ' + d.Util.escapeMarkdown(customStatus.state) : '');
        }
        if(gameStatus) {
            if(resultDescription != '') resultDescription += '\n';
            resultDescription += 'Joue à **' + d.Util.escapeMarkdown(gameStatus.name) + '**';
        }
        return resultDescription;
    }
}

module.exports = UserInfoCommand;