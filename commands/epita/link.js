const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const { DateTime } = require('luxon');
const firebase = require('firebase-admin');

let linksCodes = {};

class LinkCommand extends Command {
    
    getLinkCode(id){
        return linksCodes[id];
    }

    deleteLinkCode(id){
        delete linksCodes[id];
    }

    constructor() {
        super('link', {
            aliases: ['link', 'epitalink'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
				{
					id: 'login',
					type: 'lower',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser un login à lié') },
                        modifyRetry: () => { throw new EvalError('Le login que vous avez précisé est introuvable') },
						optional: true
					}
				}
			],
			description: {
				content: 'Reliez votre compte discord à votre login EPITA',
				usage: '[login]',
				examples: ['mareo', 'prenom.nom']
			},
            category: 'epita'
        });
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {string} args.login
     */
    async exec(message, args) {

        let epitaAccount = await firebase.database().ref(`epita/${message.author.id}`).get();
        if(epitaAccount.exists()){
            const embed = this.client.util.embed()
                .setColor(this.client.colors.green)
                .setAuthor("Bonjour "+this.capitalizeFirstLetter(epitaAccount.val().login.split('.')[0])+",")
                .setDescription('Ton login `' + epitaAccount.val().login + '` est bien lié au compte discord `' + d.Util.escapeMarkdown(message.author.tag) + '`')
                .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
                .setTimestamp();
            
            return message.util.send(embed);
        }else if(!args.login) throw new EvalError('Préciser un login à lié');


        if(linksCodes[message.author.id] 
            && linksCodes[message.author.id].time + 72e5 > Date.now()) 
            throw new Error('Vous avez déjà fais une demande il y moins de 2 heures');

        if(args.login.includes('@') || args.login.includes('`') || args.login.includes('*') || !args.login.includes('.')
            || args.login.startsWith('.') || args.login.endsWith('.')) throw new Error('Le login que vous avez précisée est invalide');

        args.login = args.login.toLowerCase();
        let login = args.login.split('.')
        let code = this.getRandomInt(10000);
        linksCodes[message.author.id] = {
            time: Date.now(),
            login: args.login,
            code: code
        };

        this.client.mail.sendMail({
            from: '"EPITA - B2 Bot" <b2@spileur.fr>',
            to: args.login + '@epita.fr',
            subject: '🔗 Reliez votre login Epita à Discord',
            html: `<div align=center><div><img src="https://i.imgur.com/UazjlyI.png" width="30%" style="max-width:250px" /></div><div style=" width:70%; max-width:550px" >Bonjour ${this.capitalizeFirstLetter(login[0]) }, <br />Vous avez demand&eacute; de lier votre compte Discord (${message.author.tag}) &agrave; votre login Epita (${args.login}) <br /><br />Votre code de confirmation : <strong> ${code} </strong> <em> (&agrave; envoy&eacute; en mp au bot) </em> <br /><br /><em> Si vous n\'&ecirc;tes pas à l\'origine de cette demande merci d\'ignorer ce mail ou de contacter le support &agrave; <a href="mailto:contact@spileur.fr"> contact@spileur.fr </a> </em></div></div>`
        })
        const embed = this.client.util.embed()
            .setColor(this.client.colors.checkedGreen)
            .setAuthor("Mail de confirmation envoyé", this.client.images.check)
            .setDescription('Vous allez recevoir un email à `'+ args.login + '@epita.fr`\n Une fois reçu, envoyer le code en message privé à ' + this.client.user.toString() + '\n*Expire dans 2 heures*')
            .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        return message.util.send(embed);
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
}

module.exports = LinkCommand;