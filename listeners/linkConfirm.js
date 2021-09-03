const { Listener } = require('discord-akairo');
const d = require('discord.js');
const firebase = require('firebase-admin');

class LinkConfirmListener extends Listener {

    constructor(){
        super('linkConfirm', {
            emitter: 'client',
            event: 'message'
        });
    }

    /**
     * 
     * @param {d.Message} message 
     */
    async exec(message) {
        let tmpFile = this.client.commandHandler.findCommand('link');
        
        if(message.channel.type == 'dm' && tmpFile.getLinkCode(message.author.id)
                    && tmpFile.getLinkCode(message.author.id).time + 72e5 > Date.now()){

            if(!message.content.startsWith(this.client.commandHandler.prefix)){

                if(tmpFile.getLinkCode(message.author.id).code.toString() === message.content.replace(' ', '')){

                    const login = tmpFile.getLinkCode(message.author.id).login;
                    firebase.database().ref(`epita/${message.author.id}`).set({
                        login: login
                    });

                    tmpFile.deleteLinkCode(message.author.id);
                    const embed = this.client.util.embed()
                        .setColor(this.client.colors.checkedGreen)
                        .setAuthor('Compte lié', this.client.images.check)
                        .setDescription('Ton compte `' + login + '` a bien été lié !')
                        .setFooter(this.client.commandHandler.prefix+"link", this.client.user.avatarURL({format: 'png', size: 128}))
                        .setTimestamp();

                    return message.channel.send(embed);

                }else{

                    const embed = this.client.util.embed()
                        .setColor(this.client.colors.red)
                        .setAuthor("Code de vérification invalide", this.client.images.no)
                        .setFooter(this.client.commandHandler.prefix+"link", this.client.user.avatarURL({format: 'png', size: 128}))
                        .setTimestamp();
                
                    return message.channel.send(embed);
                }

            }
        }
    }

}


module.exports = LinkConfirmListener;