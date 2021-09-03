const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const firebase = require('firebase-admin');
const levelMessage = require('../../listeners/levels/levelMessage');

class RankCommand extends Command {
    constructor() {
        super('rank', {
            aliases: ['rank', 'niveau'],
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
				content: 'Obtenir le rang d\'un membre',
				usage: '[membre]',
				examples: ['', 'Spileur']
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
        let databaseUser = await firebase.database().ref(`guilds/${message.guild.id}/users/${args.member.id}`).get();
        if(databaseUser.exists()){
            
            await firebase.database().ref(`guilds/${message.guild.id}/users`).orderByChild('xp').once('value', async (snapshot) => {

                let pos = snapshot.numChildren();
                let finish = false;
                snapshot.forEach(e => {
                    if(!finish){
                        if (e.key == args.member.id) finish = true;
                        else pos--; 
                    }
                })

                let res = 25;
                let outputXP = "";
                let minX = levelMessage.getMinimumXpForLevel(databaseUser.val().level);
                let x = ((databaseUser.val().xp - minX) / (levelMessage.getMinimumXpForLevel(databaseUser.val().level + 1) - minX))*res;
                for (let index = 1; index <= x; index++) {
                    outputXP += '█';
                }
                for (let index = x; index <= res; index++) {
                    outputXP += '░';
                }

                let embed = this.client.util.embed()
                    .setAuthor(args.member.displayName, args.member.user.displayAvatarURL())
                    .setDescription('Informations sur le niveau')
                    .setColor((args.member.roles.color) ? args.member.displayHexColor : this.client.colors.gray)
                    .addField('Rang', '#' + pos, true)
                    .addField('Nombre de messages', databaseUser.val().totalMessage, true)
                    .addField('Niveau', databaseUser.val().level, true)
                    .addField('XP', outputXP + '\n' + (databaseUser.val().xp - minX) + ' / ' + 
                        (levelMessage.getMinimumXpForLevel(databaseUser.val().level + 1) - minX), true)
                    .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
                    .setTimestamp();

                message.channel.send(embed);

            })
    
        }else{
            throw new Error('Le membre n\'a jamais envoyé de message');
        }
        
    }
}

module.exports = RankCommand;