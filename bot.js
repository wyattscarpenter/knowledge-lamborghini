const Discord = require('discord.js');
const nicedice = require('nicedice');
const {distance, closest} = require('fastest-levenshtein');
const https = require('https');
const client = new Discord.Client();

var text = require('./text.json');
var texts = {};
var channel;
var intervals = {};
var responses = {"hewwo": "perish", "good bot": "Don't patronize me."};
var pokemon_answers = {};

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity("Nicomachean Ethics\nhttps://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot");
});

client.on('message', message => {
  if (message.author.bot){return;} //don't let the bot respond to its own messages
  if (!message.content){return;} //don't even consider empty messages
  channel = message.channel;
  if (message.content.toLowerCase() === 'think!') {
    if(texts[channel]===undefined){
      begin_think();
    }
    if(texts[channel].length){
      think();
    }else{
      channel.send("Demand me nothing. What you know, you know.");
    }  
  }
  if (message.content.toLowerCase() === 'stop!') {
    stop_think();
  }

  if(message.content.toLowerCase().includes('nice dice')){
    message.channel.send("Sponsored by NiceDice™");
  }
  if((result = nicedice.roll(message.content.toLowerCase())).valid){
    console.log("rollin: "+JSON.stringify(message.content.toLowerCase()));
    console.log("rollout: "+JSON.stringify(result));
    message.channel.send(result.value+"\n`"+result.roll_record+"`");
  }

  //extremely dumb features
  if (/.*wh.*po.?k.?t?\s?mon.*/.test(message.content.toLowerCase())) { //who's that pokemon
    var req = https.request('https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&format=json',//image
     (resp) => {
       let data = '';
       resp.on('data', (chunk) => {data += chunk;});
       resp.on('end', () => {
         id = JSON.parse(data.match(/"File[\s\S]*"/)[0]);
         channel.send({files:[{
           attachment: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/"+encodeURIComponent(id),
           name: 'pokemon'+id.match(/\.\w*?$/)[0].toLowerCase()
         }]});
         pokemon_answers[channel] = id.match(/File:(.*)\.\w*?$/)[1];
         console.log(pokemon_answers[channel]); //console.log answer so I can cheat-- er, I mean, test.
       });
     }
    ).on("error", (err) => {console.log(err);});
    req.end();
  }
  function fuzzystringmatch(l,r){
    return distance(l,r) < (l.length * 3 / 4);
  }
  if(pokemon_answers[channel]){
    var target = pokemon_answers[channel].toLowerCase().replace(/[^a-z]/g, '');
    var guess = message.content.toLowerCase().replace(/[^a-z]/g, '');
    if (fuzzystringmatch(target, guess)){
      channel.send("It's `"+pokemon_answers[channel]+"`.\nTarget: `"+target+"` Your Guess: `"+guess+"`.");
      delete pokemon_answers[channel];
    }
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

function begin_think(){
  texts[channel] = text;
}

function think(){
  var s = texts[channel].shift();
  if(s){
    for(var l of s.split("\n")){ //break lines into seperate messages
      while(l){ //.send() Just Fails for messages over discord's 2000 character limit
        channel.send(l.slice(0,2000)); //note that this is 0-indexed and excludes the specified end character
        l = l.slice(2000); //going over is fine, you know how it is
      }
    }
    if(!intervals[channel]){intervals[channel] = setInterval(think, 1000*60*60*24);} //do it again in a day
  } else {
    stop();
  }
}

function stop_think(){
  clearInterval(intervals[channel]);
  delete intervals[channel];
}

// THIS MUST BE THIS WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
delete process.env.BOT_TOKEN; //delete this so I can't accidentally divulge it
