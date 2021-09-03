const { Listener } = require('discord-akairo');
const { Message } = require('discord.js');
const firebase = require('firebase-admin');

class LevelMessageListener extends Listener {

    constructor(){
        super('levelMessage', {
            emitter: 'client',
            event: 'message'
        });

        this.emojis = {
            award: '829451984343924756'
        }
    }

    /**
     * Adding the xp in the database
     * @param {Message} message 
     */
    async exec(message) {
        if(message.channel.type != "text" || message.author.bot || message.content.startsWith(this.client.commandHandler.prefix)) return;

        let databaseUser = await firebase.database().ref(`guilds/${message.guild.id}/users/${message.member.id}`).get();

        let lastTimeMessage = 0;
        let lastXp = 0;
        let lastLevel = 0;
        let totalMessage = 0;

        if(databaseUser.exists()){
            lastTimeMessage = databaseUser.val().timeMessage;
            lastXp = databaseUser.val().xp;
            lastLevel = databaseUser.val().level;
            totalMessage = databaseUser.val().totalMessage;
        }

        if(Date.now() > lastTimeMessage + 3e4){
            
            const actualXp = lastXp + this.getRandomInt(15, 25);
            const actualLevel = LevelMessageListener.getMinimumXpForLevel(lastLevel+1) <= actualXp ? lastLevel+1 : lastLevel;

            firebase.database().ref(`guilds/${message.guild.id}/users/${message.member.id}`).set({
                timeMessage: Date.now(),
                xp: actualXp,
                level: actualLevel,
                totalMessage: totalMessage+1
            });

            if(actualLevel > lastLevel){
                message.channel.send(message.author.toString() + " est passé au **niveau " + actualLevel + "** " + this.client.emojis.cache.get(this.emojis.award).toString())
            }

        }
    }

    static getMinimumXpForLevel(level){
        return 5*level/6*(2*level*level + 27 + 91);
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max-min)) + min;
    }
      

}


module.exports = LevelMessageListener;