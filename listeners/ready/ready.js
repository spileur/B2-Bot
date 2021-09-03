const { Listener } = require('discord-akairo');
const { TextChannel } = require('discord.js');

class ReadyListener extends Listener {

    constructor(){
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        this.initActivity();
        console.log('\x1b[32m', '💚 Le bot est en ligne', '\x1b[0m');
    }

    async initActivity(){
        await this.client.user.setActivity({name: 'les élèves travailler 👀', type: 'WATCHING'});
    }

    async modify(){
        let msg = await this.client.channels.fetch('881205257575751690');
        msg = await msg.messages.fetch('881636003440365572');
        msg.react('🇯🇵')
        msg.react('🇹🇭')
        msg.react('🇨🇳')
    }

}


module.exports = ReadyListener;
