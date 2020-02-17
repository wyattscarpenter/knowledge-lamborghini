const Discord = require('discord.js');
const client = new Discord.Client();

var text = require('./text.json');;
var channel;
var interval;

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (message.content.toLowerCase() === 'think!') {
        channel = message.channel;
        if(text.length === 0){
            channel.send("Demand me nothing. What you know, you know.");
        } else {
            think();
            if(!interval){interval = setInterval(think, 1000*60*60*24);}
        }
    }
    if (message.content.toLowerCase() === 'stop!') {
        clearInterval(interval);
        interval = 0;
    }
});

function think(){
    var s = text.shift();
    if(s){
        channel.send(s);
        console.log(s);
    } else {
        clearInterval(interval);
        interval = 0;
    }
}
        
// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
