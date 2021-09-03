const { Command, CommandUtil } = require('discord-akairo');
const d = require('discord.js');
const weather = require('../../modules/weather');
const { DateTime } = require('luxon');

class WeatherCommand extends Command {
    constructor() {
        super('weather', {
            aliases: ['weather', 'meteo'],
            clientPermissions: ['EMBED_LINKS'],
            args: [
				{
					id: 'search',
                    type: 'string',
                    match: 'content',
					prompt: {
                        time: 1,
                        modifyStart: () => { throw new EvalError('Préciser la ville où vous souhaitez avoir la météo') },
                        modifyRetry: () => { throw new EvalError('La ville est introuvable') },
						optional: false
					}
				}
			],
			description: {
				content: 'Donne la météo d\'une ville',
				usage: '[ville]',
				examples: ['', 'Paris', 'New York']
			},
            category: 'utils'
        });

        this.emojis = {
            loading : '711928319473483977'
        }
    }

    /**
     * @param {d.Message} message
     * @param {CommandUtil} message.util
     * @param {Object} args
     * @param {string} args.search
     */
    async exec(message, args) {
        const search = args.search;

        const embed = this.client.util.embed()
            .setColor(this.client.colors.green)
            .setDescription(this.client.emojis.cache.get(this.emojis.loading).toString() + ' **Recherche en cours ...**')
            .setFooter(this.client.commandHandler.prefix + this.id, this.client.user.avatarURL({format: 'png', size: 128}))
            .setTimestamp();

        await message.util.send(embed);

        const result = await weather.find({search: search, degreeType: 'C'});

        if (result.length == 0) throw new Error('Aucun résultat pour "'+ d.Util.escapeMarkdown(search) +'"');

        const current = result[0].current;
        const location = result[0].location;
        const timezone = `UTC${(location.timezone >= 0)?"+"+location.timezone:location.timezone}`;

        embed.setDescription(`**${current.skytext}**`)
            .setTitle(`Météo pour \`${current.observationpoint}\``)
            .setThumbnail("https://images.weserv.nl/?url=" + current.imageUrl+ "&output=png")

            .addField('Température',`${current.temperature}°C`, true)
            .addField('Ressentie', `${current.feelslike}°C`, true)
            .addField('Vent', current.winddisplay + " :dash:", true)
            .addField('Humidité', `${current.humidity}% :droplet:`, true)
            .addField('Fuseau horaire',`${timezone} :earth_africa:`, true)
            .addField('Heure',`${DateTime.fromJSDate(new Date()).setZone(timezone).toFormat('HH:mm')} :clock1:`, true);

            
        return message.util.send(embed);
    }
}

module.exports = WeatherCommand;