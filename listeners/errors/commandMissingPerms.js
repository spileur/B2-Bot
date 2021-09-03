const { Listener, Command } = require('discord-akairo');
const d = require('discord.js');

class MissingPermissionsListener extends Listener {

    constructor(){
        super('commandMissingPerms', {
            emitter: 'commandHandler',
            event: 'missingPermissions'
        });
    }

    /**
     * @param {d.Message} message
     * @param {Command} command
     * @param {string} type
     * @param {any} missing
     */
    async exec(message, command, type, missing) {
        if(type == 'user'){
            const embed = this.client.util.embed()
                .setColor(this.client.colors.red)
                .setAuthor('Vous n\'avez pas la permission d\'effectuer cette commande', this.client.images.stop)
                .setFooter(this.client.commandHandler.prefix+command.id, this.client.user.avatarURL({format: 'png', size: 128}))
                .setTimestamp();

            return message.util.send(embed);
        }
        
        const embed = this.client.util.embed()
            .setColor(this.client.colors.red)
            .setAuthor('Le bot n\'a pas les permissions suffisantes', this.client.images.alert)
            .setDescription('Permission(s) manquante(s) : ' + missing.map(value => '`'+ value +'`').join(' '))
            .setFooter(this.client.commandHandler.prefix+command.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        return message.util.send(embed);
    }   

}


module.exports = MissingPermissionsListener;