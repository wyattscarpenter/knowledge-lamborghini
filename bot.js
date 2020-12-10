const Discord = require('discord.js');
const nicedice = require('nicedice');
const https = require('https');
const client = new Discord.Client();

var text = require('./text.json');
var channel;
var interval;
var responses = {"hewwo": "perish", "good bot": "Don't patronize me."};

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity("Nicomachean Ethics\nhttps://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot");
});

client.on('message', message => {
  if (message.author.bot){return;} //don't let the bot respond to its own messages
  channel = message.channel;
  if (message.content.toLowerCase() === 'think!') {
    if(text.length){
      think();
    }else{
      channel.send("Demand me nothing. What you know, you know.");
    }  
  }
  if (message.content.toLowerCase() === 'stop!') {
    stop();
  }

  if(message.content.toLowerCase().includes('nice dice')){
    message.channel.send("Sponsored by NiceDice™");
  }
  if((result = nicedice.roll(message.content.toLowerCase())).valid){
      message.channel.send(result.value+"\n`"+result.roll_record+"`");
  }

  //extremely dumb features
  if (/.*wh.*po.?k.?t?\s?mon.*/.test(message.content.toLowerCase())) { //who's that pokemon //doesn't even work yet
    var req = https.request('https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&format=json',//image
     (resp) => {
       let data = '';
       resp.on('data', (chunk) => {data += chunk;});
       resp.on('end', () => {channel.send("https://commons.wikimedia.org/wiki/"+data.match(/File[\s\S]*"/));} );
     }
    ).on("error", (err) => {console.log(err);});
    req.end();
  }
  if (message.content.toLowerCase().startsWith("set")) {
    msg = message.content.toLowerCase().split(/\s(.+)/)[1];
    thingum = msg.split(/\s(.+)/);
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
      while(l){ //.send() Just Fails for messages over discord's 2000 character limit
        channel.send(l.slice(0,2000)); //note that this is 0-indexed and excludes the specified end character
        l = l.slice(2000); //going over is fine, you know how it is
      }
    }
    if(!interval){interval = setInterval(think, 1000*60*60);} //do it again in an hour
  } else {
    stop();
  }
}

function stop(){
  clearInterval(interval);
  interval = 0;
}

// THIS MUST BE THIS WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
delete process.env.BOT_TOKEN; //delete this so I can't accidentally divulge it
