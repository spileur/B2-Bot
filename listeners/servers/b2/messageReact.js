const { Listener } = require('discord-akairo');
const { Message } = require('discord.js');

class MessageListener extends Listener {

    constructor(){
        super('message', {
            emitter: 'client',
            event: 'message'
        });

        this.emojis = require('../../../modules/emojis');

        this.reactMembers = {
            //     USER ID                       REACTIONS
            '748486247927775253' : ['🇲', '🇦', '🇹', '🇭', '🇮', '🇸', '❤️'],
            '302526256119939072' : ['🇱', '🇴', '🇷', '🇮', '🇳', '🇪', '👀'],
            '124572091944140800' : ['🇨', '🇪', '🇱', '🇮', '🇧', '🇦', '🇹', '811676836173971498', '784488185848791052'],
            '619615586279882813' : ['🇦', '🇵', '🇪', '🇷', '🇴', '764915525917868033'],
            '241255360839680001' : ['🅱', '🇪', '🇧', '🇴', '🇺', '❤️'],
            '341576237141196800' : ['👑'],
            '280804227737976833' : ['779343792867115058'],
            '619564810241048596' : ['828654994583584859'],
            '248478941830971393' : ['811676836173971498'],
        }

        this.degenereChannelID = '827498221051969546';
        this.emojiBattleChannelID = '825525282353840138';

        this.QcmCategoryID = '812382720469762139';
        this.QCmChatChannelID = '821048027111489536';
    }

    /**
     * @param {Message} message 
     */
    async exec(message) {
        if(message.channel.id == this.degenereChannelID && this.reactMembers[message.author.id]){
            this.reactMembers[message.author.id].forEach(async element => {
               await message.react(element);
            });
        }else if(message.channel.id == this.emojiBattleChannelID && !message.author.bot){
            let rad = this.getRandomInt(this.emojis.length);
            message.channel.send(this.emojis[rad]);
        }else if(message.channel.parentID == this.QcmCategoryID && message.channel.id != this.QCmChatChannelID
                && message.attachments.size > 0){
            message.react('✅');
            message.react('🤷‍♂️');
            message.react('❌');
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

}

module.exports = MessageListener;