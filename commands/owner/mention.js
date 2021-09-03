const { Command, CommandUtil } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const { Message } = require('discord.js');

class MentionCommand extends Command {
    constructor() {
        super('mention', {
            aliases: ['mention'],
            args: [
                {
                    id: 'member',
                    type: 'string'
                },
                {
                    id: 'repetion',
                    type: 'number'
                },
            ],
            ownerOnly: true
        });
    }

    /**
     * @param {Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {String} args.member
     */
    async exec(message, args) {
        for (let index = 0; index < args.repetion; index++) {
            message.channel.send(`<@${args.member}>`)
        }
    }
}

module.exports = MentionCommand;