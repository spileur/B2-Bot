const { Listener, Reaction } = require('discord-akairo');
const { User, MessageReaction} = require('discord.js');

class RoleReactAddListener extends Listener {


    constructor(){
        super('roleReactAddB2', {
            emitter: 'client',
            event: 'messageReactionAdd'
        });
        
		this.messageDestination = "881636003440365572";

		this.roleChine = "881636114346164294";
		this.roleThailade = "881636132218110032";
		this.roleJapon = "881636134084567040";
    }

    /**
     * 
     * @param {MessageReaction} reaction
     * @param {User} user 
     */
    async exec(reaction, user) {

        if (reaction.message.partial) await reaction.message.fetch();
        let member = await reaction.message.guild.members.fetch(user.id);

		if(reaction.message.id == this.messageDestination){
			if(reaction.emoji.toString() === '🇯🇵'){
				member.roles.add(this.roleJapon);
			}
			if(reaction.emoji.toString() === '🇹🇭'){
				member.roles.add(this.roleThailade);
			}
			if(reaction.emoji.toString() === '🇨🇳'){
				member.roles.add(this.roleChine);
			}
		
		}
    }

}

module.exports = RoleReactAddListener;
