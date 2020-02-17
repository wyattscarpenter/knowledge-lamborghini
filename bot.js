const Discord = require('discord.js');
const client = new Discord.Client();

var example = ["a", "b", "c"];

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (message.content === 'ping') {
       interval = setInterval(() => {message.reply(think())}, 1000);
    }
});

function think(){
    var s = example.shift();
    if(s){
        return s;
    } else {
        clearInterval(interval);
    }
}
        
// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
