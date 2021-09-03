const { Listener } = require('discord-akairo');
const d = require('discord.js');
const firebase = require('firebase-admin');

class WebhookDeleteListener extends Listener {

    constructor(){
        super('webhookDelete', {
            emitter: 'client',
            event: 'webhookUpdate'
        });
    }

    /**
     * 
     * @param {d.TextChannel} channel 
     */
    async exec(channel) {
        let databaseWebhook = await firebase.database().ref(`webhooks/${channel.id}`).get();

        if(databaseWebhook.exists()){

            let webhookList = await channel.fetchWebhooks();

            if(!webhookList.has(databaseWebhook.val().webhookId)){

                await firebase.database().ref(`webhooks/${channel.id}`).remove();

            }
        }
    }

}


module.exports = WebhookDeleteListener;