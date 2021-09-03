const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const firebase = require('firebase-admin');

class LevelsCommand extends Command {
    constructor() {
        super('levels', {
            aliases: ['levels', 'top', 'ranking'],
            clientPermissions: ['EMBED_LINKS'],
            args: [],
			description: {
				content: 'Afficher le podium du serveur',
				usage: '',
				examples: ['']
			},
            category: 'utils'
        });
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     */
    async exec(message, args) {
        firebase.database().ref(`guilds/${message.guild.id}/users`).orderByChild('xp').limitToLast(10).once('value', (snapshot) => {

            let output = "";
            let pos = snapshot.numChildren() < 10 ? snapshot.numChildren() : 10;

            snapshot.forEach(child => {
                output = '#' + pos + ' - ' + this.client.users.cache.get(child.key).tag + ' - Level ' + child.val().level + '\n' + output;
                pos--;
            })
            
            message.channel.send(output);
        });
    }
}

module.exports = LevelsCommand;