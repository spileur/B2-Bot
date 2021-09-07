const fetch = require("node-fetch");
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
            this.publishWebhook(date);
            this.loopTimeTable();
        }, waitTime);
    }

    generateDescription(course) {
        return '**' + DateTime.fromISO(course.startDate).setLocale('fr').toFormat("HH'h'mm") + ' - ' +
                                    DateTime.fromISO(course.endDate).setLocale('fr').toFormat("HH'h'mm") + '**' + '\n' +
                                    '__Durée :__ ' + this.formatTime(Date.parse(course.endDate)-Date.parse(course.startDate)) + '\n' +
                                    (course.rooms.length > 0 ? '__Salle(s) :__ ' + this.getList(course.rooms) + '\n' : '') +
                                    (course.teachers.length > 0 ? '__Prof(s) :__ ' + this.getList(course.teachers) + '\n' : '');
    }

    getList(list){
        let output = "";
        let start = true;
        for(let e of list){
            if(start)
                start = false;
            else
                output += ", ";
            if(e.firstname)
                output += e.firstname + " ";
            output += e.name;
        }
        return output;
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
      .toFormat('cccc dd LLLL')
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

    /**
     * 
     * @param {Date} date 
     */
    async publishWebhook(date){
        if(DateTime.fromJSDate(date).weekday == 6 || DateTime.fromJSDate(date).weekday == 7) return;

        let value = await firebase.database().ref(`webhooks`).get();

        for(const [key, server] of Object.entries(value.val())){

                const webhookClient = new WebhookClient(server.webhookId, server.webhookToken);

                let content = '';
                let embeds = [];
    
                let timetables = await fetch('https://zeus.infinity.study/api/groups/' + server.class + "/reservations" ,{
                    method: "GET"
                }).then(response => response.json());

                /*const timetables = await ical.async.fromURL('https://ichronos.net/feed/INFO' + server.class.replace('#', '%23') + '-1.ics');
                const timetables_2 = await ical.async.fromURL('https://ichronos.net/feed/INFO' + server.class.replace('#', '%23') + '-2.ics');*/
                
                content = ' ⁢⁢⁢⁢⁢ \n ⁢⁢⁢⁢⁢ \n ⁢⁢⁢⁢⁢ \n**__' + this.formatDate(date) + '__**';
                
                let alreadyDone = [];

                let i = 0;
                for (const timetable of timetables) {
                    
                    if(new Date(timetable.startDate).getDate() != date.getDate() ||
                        new Date(timetable.startDate).getMonth() != date.getMonth() || alreadyDone.includes(Date.parse(timetable.startDate))) continue;
                    
                    let timetable_groups = await timetables.filter(e => e.startDate === Date.parse(timetable.startDate) && e.groups.find(e => e.id == server.class) == null);
                    if(timetable.summary === 'CIE' || timetable.summary === 'TIM') timetable.summary = 'Anglais';
                    
                    
                    const embed = this.client.util.embed()
                                        .setTitle((this.summary_icon[timetable.name] ? this.summary_icon[timetable.name][0] + '  ' : '') + timetable.name)
                                        .setColor((this.summary_icon[timetable.name] ? this.summary_icon[timetable.name][1] : '#3F48CC'))
                                        .setDescription(this.generateDescription(timetable))
                                        .setTimestamp(Date.parse(timetable.startDate));
                    
                    if(timetable_groups > 0){
                        for(let el_timetable of timetable_groups){
                            embed.addField(el_timetable.groups[0].name, this.generateDescription(el_timetable), true);
                        }
                        embed.setDescription("");
                    }

                    embeds.push(embed);
                    alreadyDone.push(Date.parse(timetable.startDate));

                    i++;
                };
    
                if(i == 0){
                    embeds.push(this.client.util.embed().setColor(this.client.colors.red).setTitle('❌ Aucun cours'));
                }
    
                webhookClient.send(content, {
                    username: 'EpiTime - ' + server.display,
                    avatarURL: 'https://i.imgur.com/vLm0xmV.png',
                    embeds: embeds,
                });
            
        }
    }

}

module.exports = TimetableListener;