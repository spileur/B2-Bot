const { Listener } = require('discord-akairo');
const { TextChannel, WebhookClient } = require('discord.js');
const ical = require('node-ical');
const { DateTime, Duration } = require('luxon');
const firebase = require('firebase-admin');

class TimetableListener extends Listener {

    constructor(){
        super('timetable', {
            emitter: 'client',
            event: 'ready'
        });

        this.summary_icon = {
            'Mathématiques': ['📊', '#CCCCFF'],
            'Algorithmique' : ['💻', '#02CC10'],
            'Physique' : ['🧪', '#FFCC66'],
            'TE' : ['🎙', '#FFCCFF'],
            'Anglais' : ['🇬🇧', '#FFFE66'],
            'Electronique' : ['⚡', '#67FFFF'],
            'Architecture' : ['🧱', '#67FFFF'],
            'Programmation' : ['👨‍💻', '#00CC66'],
            'JAPONAIS' : ['🇯🇵', '#FF3333'],
            'COREEN' : ['🇰🇷', '#FFCC66'],
            'VACANCES' : ['🏝', '#FFFFCC'],
            'FERIE' : ['😎', '#FFFFCC'],
            'Soutenance' : ['📋', '#FFFE33']
        }

        this.postDate = {hours: 18, minutes: 0, seconds: 0};

        
        this.channelTimetable = '760615793833803836';
        this.class = 'INFOS2B2';
    }

    async exec() {
        await this.loopTimeTable();
    }

    async loopTimeTable(){
        let now = new Date();
        let date = new Date();

        date.setHours(this.postDate.hours, this.postDate.minutes, this.postDate.seconds, 0);
        while (date.getTime()-now.getTime() < 0){
            date.setDate(date.getDate()+1);
        }
        
        const waitTime = (date.getTime()-now.getTime());
        setTimeout(async () => {
            date.setDate(date.getDate()+1);
            //this.sendTimeTable(date);
            this.publishWebhook(date);
            this.loopTimeTable();
        }, waitTime);
    }

    async sendTimeTable(date){
        
        if(DateTime.fromJSDate(date).weekday == 6 || DateTime.fromJSDate(date).weekday == 7) return;

        const channelTimetable = await this.client.channels.fetch(this.channelTimetable);

        const timetables = await ical.async.fromURL('https://ichronos.net/feed/' + this.class + '-1.ics');
        const timetables_2 = await ical.async.fromURL('https://ichronos.net/feed/' + this.class + '-2.ics');
        const info_semaine = Object.values(timetables).find(event => event.start.getHours() >= 0 && event.start.getHours() <= 5 && event.start.getDate() == date.getDate());

        channelTimetable.send(' ⁢⁢⁢⁢⁢ \n ⁢⁢⁢⁢⁢ \n ⁢⁢⁢⁢⁢ \n**__' + this.formatDate(date) + '__**' +
            (info_semaine ? '\n*' + info_semaine.summary.charAt(0) + info_semaine.summary.substr(1).toLowerCase() + '*' : ''));

        let i = 0;
        for (const timetable of Object.values(timetables)) {
            if(timetable.start.getDate() !== date.getDate() || timetable.start.getHours() == 3) continue;

            let timetable_2 = Object.values(timetables_2).find(event => event.start.getTime() == timetable.start.getTime());
            if(timetable.summary === 'CIE' || timetable.summary === 'TIM') timetable.summary = 'Anglais';

            const embed = this.client.util.embed()
                                .setTitle((this.summary_icon[timetable.summary] ? this.summary_icon[timetable.summary][0] + '  ' : '') + timetable.summary)
                                .setColor((this.summary_icon[timetable.summary] ? this.summary_icon[timetable.summary][1] : this.client.colors.gray))
                                .setDescription(this.generateDescription(timetable))
                                .setTimestamp(timetable.start);

            if(timetable_2 && timetable_2.summary !== timetable.summary){
                embed.addField('Groupe 1', embed.description, true);
                embed.addField('Groupe 2', this.generateDescription(timetable_2), true);
                embed.setDescription("");
            }

            channelTimetable.send(embed);
            i++;
        };

        if(i == 0){
            channelTimetable.send(this.client.util.embed().setColor(this.client.colors.red).setTitle('❌ Aucun cours'))
        }
    }

    generateDescription(timetable) {
        return '**' + DateTime.fromJSDate(timetable.start).setLocale('fr').toFormat("HH'h'mm") + ' - ' +
                                    DateTime.fromJSDate(timetable.end).setLocale('fr').toFormat("HH'h'mm") + '**' + '\n' +
                                    '__Durée :__ ' + this.formatTime(timetable.end.getTime()-timetable.start.getTime()) + '\n' +
                                    (timetable.location ? '__Salle :__ ' + timetable.location + '\n' : '') +
                                    (timetable.description && timetable.description.startsWith('Prof') ? '__Prof :__ ' + timetable.description.replace('Profs : ', '')
                                    .replace('Prof : ', '').split('(')[0] + '\n' : '');
    }
    
    formatTime(time){
        let duration = Duration.fromMillis(time);
        if(duration.as("hours") < 1){
            return duration.toFormat("mm'min'");
        }else{
            if((duration.as("minute") % 60) == 0){
                return duration.toFormat("hh'h'");
            }else{
                return duration.toFormat("h'h'mm'min'");
            }
        }
    }

    formatDate(date){
    return DateTime.fromJSDate(date, { zone: "Europe/Paris" })
      .setLocale("fr")
      .toFormat('ccc dd LLLL')
      .replace(/([0-9]{4}) (M[0-9]{2}) ([0-9]{2})/, "$3 $2 $1")
      .replace(/M01/, "Janvier")
      .replace(/M02/, "Février")
      .replace(/M03/, "Mars")
      .replace(/M04/, "Avril")
      .replace(/M05/, "Mai")
      .replace(/M06/, "Juin")
      .replace(/M07/, "Juillet")
      .replace(/M08/, "Août")
      .replace(/M09/, "Septembre")
      .replace(/M10/, "Octobre")
      .replace(/M11/, "Novembre")
      .replace(/M12/, "Décembre")
      .replace(/Mon/, 'Lundi')
      .replace(/Tue/, 'Mardi')
      .replace(/Wed/, 'Mercredi')
      .replace(/Thu/, 'Jeudi')
      .replace(/Fri/, 'Vendredi')
      .replace(/Sat/, 'Samedi')
      .replace(/Sun/, 'Dimanche');
    }

    async publishWebhook(date){
        if(DateTime.fromJSDate(date).weekday == 6 || DateTime.fromJSDate(date).weekday == 7) return;

        let value = await firebase.database().ref(`webhooks`).get();

        for(const [key, server] of Object.entries(value.val())){

                const webhookClient = new WebhookClient(server.webhookId, server.webhookToken);

                let content = '';
                let embeds = [];
    
                const timetables = await ical.async.fromURL('https://ichronos.net/feed/INFO' + server.class.replace('#', '%23') + '-1.ics');
                const timetables_2 = await ical.async.fromURL('https://ichronos.net/feed/INFO' + server.class.replace('#', '%23') + '-2.ics');
                const info_semaine = Object.values(timetables).find(event => event.start != null && event.start.getDate() == date.getDate() && event.start.getHours() == 3);
                
                content = ' ⁢⁢⁢⁢⁢ \n ⁢⁢⁢⁢⁢ \n ⁢⁢⁢⁢⁢ \n**__' + this.formatDate(date) + '__**' +
                    (info_semaine ? '\n*' + info_semaine.summary.charAt(0) + info_semaine.summary.substr(1).toLowerCase() + '*' : '');
                
                let i = 0;
                for (const timetable of Object.values(timetables)) {
                    
                    if(timetable.start == null || timetable.start.getDate() !== date.getDate() || timetable.start.getHours() == 3) continue;
                    
                    let timetable_2 = Object.values(timetables_2).find(event => event.start.getTime() == timetable.start.getTime());
                    if(timetable.summary === 'CIE' || timetable.summary === 'TIM') timetable.summary = 'Anglais';
                    
                    const embed = this.client.util.embed()
                                        .setTitle((this.summary_icon[timetable.summary] ? this.summary_icon[timetable.summary][0] + '  ' : '') + timetable.summary)
                                        .setColor((this.summary_icon[timetable.summary] ? this.summary_icon[timetable.summary][1] : '#3F48CC'))
                                        .setDescription(this.generateDescription(timetable))
                                        .setTimestamp(timetable.start);
                    if(timetable_2 && timetable_2.summary !== timetable.summary){
                        embed.addField('Groupe 1', embed.description, true);
                        embed.addField('Groupe 2', this.generateDescription(timetable_2), true);
                        embed.setDescription("");
                    }
    
                    embeds.push(embed);
    
                    i++;
                };
    
                if(i == 0){
                    embeds.push(this.client.util.embed().setColor(this.client.colors.red).setTitle('❌ Aucun cours'));
                }
    
                webhookClient.send(content, {
                    username: 'EpiTime - ' + server.class,
                    avatarURL: 'https://i.imgur.com/3ljRmQm.png'/*'https://i.imgur.com/vLm0xmV.png'*/,
                    embeds: embeds,
                });
            
        }
    }

}

module.exports = TimetableListener;