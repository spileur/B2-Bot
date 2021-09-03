const { Command, CommandUtil } = require('discord-akairo');
const { Message } = require('discord.js');

class SayCommand extends Command {
    constructor() {
        super('say', {
            aliases: ['say'],
            args: [
                {
                    id: 'message',
                    match: 'content',
                    default: message => " "
                }
            ],
            ownerOnly: true
        });
    }

    /**
     * @param {Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {String} args.message
     */
    async exec(message, args) {
        message.delete();
        return message.channel.send(args.message.replace('%everyone', '@everyone').replace('%here', '@here'), message.attachments.first());
    }
}

module.exports = SayCommand;