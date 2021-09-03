const { Listener, Command } = require('discord-akairo');
const d = require('discord.js');

class CommandErrorListener extends Listener {

    constructor(){
        super('commandError', {
            emitter: 'commandHandler',
            event: 'error'
        });
    }

    /**
     * @param {Error} error
     * @param {d.Message} message
     * @param {Command} command
     */
    async exec(error, message, command) {
        const embed = this.client.util.embed()
                .setColor(this.client.colors.red)
                .setAuthor(error.message, this.client.images.no)
                .setFooter(this.client.commandHandler.prefix+command.id, this.client.user.avatarURL({format: 'png', size: 128}))
                .setTimestamp();
        if(error.stack && error.name != 'Error') console.log(error.stack);
        return message.util.send(embed);
    }   

}


module.exports = CommandErrorListener;