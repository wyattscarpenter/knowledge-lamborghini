const Discord = require('discord.js');
const client = new Discord.Client();

var text = require('./text.json');
var channel;
var interval;
var responses = {"hewwo": "perish"};

client.on('ready', () => {
    console.log('I am ready!');
    client.user.setGame('Nicomachean Ethics');
});

client.on('message', message => {
    if (message.content.toLowerCase() === 'think!') {
        channel = message.channel;
        if(text.length === 0){
            channel.send("Demand me nothing. What you know, you know.");
        } else {
            think();
            if(!interval){interval = setInterval(think, 1000*60*60);}
        }
    }
    if (message.content.toLowerCase() === 'stop!') {
        clearInterval(interval);
        interval = 0;
    }

    //extremely dumb features
    if (message.content.toLowerCase().test(/.*who.*pok.?mon.*/)) {
        channel.send("It's https://en.wikipedia.org/wiki/Special:Random");
    }
    if (message.content.toLowerCase().startsWith("eval")) {
        //NEVER use this in production
        channel.send(eval(message.content));
    }
    if (message.content.toLowerCase().startsWith("set")) {
        msg = message.content.toLowerCase().split(/\s(.+)/)[1];
        thingum = message.content.toLowerCase().split(/\s(.+)/);
        responses[thingum[0]] = thingum[1];
    }
    if (message.content.toLowerCase() in responses) {
        channel.send(responses[message.content]);
    }
});

function think(){
    var s = text.shift();
    if(s){
        for(var l of s.split("\n")){ //break lines into seperate messages
            do{ //discord 2048 character limit
                var chunk = l.slice(0,2048);
                channel.send(chunk); //tbh I never bothered to find out if .send() Just Works for too long messages
                console.log(chunk);
                l = l.slice(2048);
            }while(l.length > 0);
        }
    } else {
        clearInterval(interval);
        interval = 0;
    }
}

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
