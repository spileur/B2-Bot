const { Listener } = require('discord-akairo');
const { Message } = require('discord.js');

class SugListener extends Listener {

    constructor(){
        super('suggestionsAutoReactB2', {
            emitter: 'client',
            event: 'message'
        });

        this.sugChannelID = '880502734963507251';

        this.emojis = {
            yes: '819217241613664286',
            no: '819217240959221760'
        }
    }

    /**
     * 
     * @param {Message} message 
     */
    async exec(message) {

        if(message.channel.id === this.sugChannelID){
            await message.react(this.emojis.yes);
            await message.react(this.emojis.no);
        }
    }

}


module.exports = SugListener;