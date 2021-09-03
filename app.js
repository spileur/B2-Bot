require('dotenv').config();
const firebase = require('firebase-admin');
const nodemailer = require('nodemailer');
const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');

class B2Client extends AkairoClient {

    constructor(){
        super({
            ownerID: ['124572091944140800', '619615586279882813'],
            presence: {
				status: 'online',
				activity: {
					type: 'WATCHING',
					name: 'Redémarrage...',
				}
            }
        }, {
            disableEveryone: true,
            partials: ['MESSAGE', 'CHANNEL', 'REACTION']
        });

        console.log('\x1b[0m', '📌 Démarrage de l\'application...', '\x1b[0m');

        this.colors = {
            green: '#00C582',
            checkedGreen: '#27ae60',
            gray: '#8e9297',
            red: '#f44336'
        }

        this.images = {
            no: 'https://i.imgur.com/Kd1NgOh.png',
            stop: 'https://i.imgur.com/D1VmZSy.png',
            alert: 'https://i.imgur.com/fbqNVXZ.png',
            check: 'https://i.imgur.com/nEzMOY1.png'
        }

        this.categoryTitle = {
            musique: '🎶\u2000Musique',
            fun: '🎉\u2000Fun',
            epita: '📚\u2000Epita',
            bot: '🤖\u2000Bot',
            utils: '🔩\u2000Utile',
            moderation: '⚡\u2000Modération',
            owner: '👑\u2000Owner'
        };

        this._initHandlers();

        this.zeusToken = process.env.ZEUS_TOKEN;
        this.firebase = this._initDatabase();

        this.mail = this._initMail();
        this.confirmMailCode = {}
    }


    _initDatabase(){
        firebase.initializeApp({
            credential: firebase.credential.cert(require('./firebaseAccountKey.json')),
            databaseURL: "https://b2-bot-default-rtdb.europe-west1.firebasedatabase.app"
        });
        return firebase.database();
    }

    _initMail(){
        return nodemailer.createTransport({
            host: 'plesk1.dyjix.eu',
            port: 465,
            secure: true,
            auth: {
                user: 'b2@spileur.fr',
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    _initHandlers(){
        this.commandHandler = new CommandHandler(this, {
            directory: './commands/',
            allowMention: true,
            commandUtil: true,
            handleEdits: true,
            blockBots: true,
            defaultCooldown: 500,
            ignoreCooldown: this.ownerID,
            ignorePermissions: this.ownerID,
            prefix: '&'
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './inhibitors/'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './listeners/'
        })

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler,
            process: process
        })

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.commandHandler.loadAll();
    }

}

const client = new B2Client();
client.login(process.env.DISCORD_TOKEN);
