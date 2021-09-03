const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const fetch = require('node-fetch');
const firebase = require('firebase-admin');

class CrimageCommand extends Command {
    constructor() {
        super('crimage', {
            aliases: ['crimage', 'imagecri'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
					id: 'login',
                    type: 'string',
					match: 'content',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser un login ou un membre') },
                        modifyRetry: () => { throw new EvalError('Le login que vous avez précisé est introuvable') },
						optional: false
					},
                    
				}
			],
			description: {
				content: 'Afficher la photo de profil d\'un membre d\'EPITA',
				usage: '[membre/login]',
				examples: ['mareo', 'prenom.nom', '@Spileur']
			},
            category: 'epita'
        });

        this.emojis = {
            loading : '711928319473483977'
        }
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {string} args.login
     */
    async exec(message, args) {
        let member = await this.client.util.resolveMember(args.login, message.guild.members.cache);
        
        if(member){
            let databaseUser = await firebase.database().ref(`epita/${member.id}`).get();
            if(databaseUser.exists()){
                args.login = databaseUser.val().login;
            }
        }

        if(args.login.includes(' ')) args.login = args.login.split(' ').join('.');
        args.login = args.login.toLowerCase();


        let embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setDescription(this.client.emojis.cache.get(this.emojis.loading).toString() + ' **Recherche en cours ...**')
            .setFooter(this.client.commandHandler.prefix + this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();
        await message.util.send(embed);

        const result = await fetch(`https://photos.cri.epita.fr/${args.login}`, {}).then(res => res.text());
        
        if(result.length > 1e4){
            
            embed = this.client.util.embed()
                .setColor(this.client.colors.green)
                .setTitle('Photo de **' + d.Util.escapeMarkdown(this.formatName(args.login)) + '**')
                .setImage(`https://photos.cri.epita.fr/${args.login}`)
                .setFooter(this.client.commandHandler.prefix+this.id + " | cri.epita.fr", this.client.user.avatarURL({format: 'png', size: 128}))
                .setTimestamp();
            
            return message.util.send(embed);
        }
        
        throw new Error('Le login ou le membre est introuvable');
    }

    /**
     * Format the name with a capital letter
     * @param {string} login
     */
    formatName(login){
        let result = login.split('.');
        if(result.length > 1){
            return result[0][0].toUpperCase() + result[0].substring(1) + " " + result[1][0].toUpperCase() + result[1].substring(1);
        }else if(result.length > 0){
            return result[0][0].toUpperCase() + result[0].substring(1);
        }
        return "";
    }
}

module.exports = CrimageCommand;