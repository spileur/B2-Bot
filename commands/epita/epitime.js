const fetch = require("node-fetch");
const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const firebase = require('firebase-admin');

class EpiTimeCommand extends Command {
    constructor() {
        super('epitime', {
            aliases: ['epitime'],
            clientPermissions: ['EMBED_LINKS', 'MANAGE_WEBHOOKS'],
            userPermissions: ['MANAGE_WEBHOOKS'],
            args: [
				{
					id: 'class',
                    match: 'content',
                    prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser une classe (ex: S1S2 B2)') },
                        modifyRetry: () => { throw new EvalError('La classe est invalide ou introuvable (ex: S1S2 B2)') },
						optional: false
					}
				}
			],
			description: {
				content: 'Recevoir l\'emploi du temps dans ce salon tous les jours à 18h',
				usage: '[classe]',
				examples: ['S1S2 B2', 'S1d']
			},
            category: 'epita'
        });
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {string} args.class
     */
    async exec(message, args) {
        if(!args.class.startsWith('S') || args.class.length < 4) throw new Error('La classe est invalide ou introuvable (ex: S1S2 B2)');

        let databaseWebhook = await firebase.database().ref(`webhooks/${message.channel.id}`).get();

        let webhooksList = await message.channel.fetchWebhooks();

        if(databaseWebhook.exists() && webhooksList && webhooksList.has(databaseWebhook.val().webhookId)){
            const embed = this.client.util.embed()
                .setColor(this.client.colors.red)
                .setAuthor('EpiTime est déjà relié à ce salon', this.client.images.no)
                .setDescription('Pour changer de classe ou supprimer le bot de ce salon, il vous suffit de supprimer le webhook EpiTime.')
                .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
                .setTimestamp();

            return message.util.send(embed);
        }

        let groups = await fetch('https://zeus.3ie.fr/api/group',{
            method: "GET",
            headers: {
                "Authorization": "Bearer " + this.client.zeusToken,
            }
        }).then(response => response.json());
        let group = groups.find(e => e.name === args.class);

        if(!group)
           throw new Error('La classe est invalide ou introuvable (ex: S1S2 B2)');

        let webhook = await message.channel.createWebhook('EpiTime', {
            avatar: 'https://i.imgur.com/vLm0xmV.png'
        });

        firebase.database().ref(`webhooks/${message.channel.id}`).set({
            class: group.id,
            webhookId: webhook.id,
            webhookToken: webhook.token
        });

        const embed = this.client.util.embed()
                .setColor(this.client.colors.checkedGreen)
                .setAuthor('EpiTime a été ajouté à ce salon', this.client.images.check)
                .setDescription('Tous les jours à 18h l\'emploi du temps sera envoyé dans ' + message.channel.toString() +
                    '.\n Pour supprimer ou changer de classe, il vous suffit de supprimer le webhook EpiTime de ce salon.')
                .setFooter(this.client.commandHandler.prefix+this.id, this.client.user.avatarURL({format: 'png', size: 128}))
                .setTimestamp();

        return message.util.send(embed);
    }
}

module.exports = EpiTimeCommand;
