const Discord = require('discord.js');
const nicedice = require('nicedice');
const {distance, closest} = require('fastest-levenshtein');
const https = require('https');
const client = new Discord.Client();

var text = require('./text.json'); //At this time, this is the W. D. Ross 1908 translation of Nicomachean Ethics, as best I can tell.
var texts = {};
var channel;
var intervals = {};
var responses = {"hewwo": "perish", "good bot": "Don't patronize me."};
var pokemon_answers = {};

client.on('ready', () => {
  console.log('I am ready!');
  setInterval(update_status_clock, 60*1000); //Doesn't update every second because that's too frequent and the status gets stuck. Note that this means we may be behind by up to a full minute. I haven't tested the minimum interval at which discord will allow us to refresh.
});

client.on('message', message => {
  if (message.author.bot){return;} //don't let the bot respond to its own messages
  if (!message.content){return;} //don't even consider empty messages
  channel = message.channel;
  
  //oldify reddit links.
  if ( message.content.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi) ){
  //here we check if null first to avoid crash on trying to iterate over null. having done that, we actually do the thing:
    for (r of message.content.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi ) ){
      //huge character list from https://stackoverflow.com/a/1547940
      //note that it was easier to detect reddit urls and then futz with them each individually than do some crazy capture-jutsu. 
      if (!r.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*old\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi)){ //It's already old reddit, do nothing.
        target = r.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/([\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*)/ )[1]; // "target" is not here meant to have any precise technical meaning, it's just all the url stuff after the first / (almost, but not quite, a "path").
        channel.send("<https://old.reddit.com/"+target+">"); //note that urls followed by eg a comma might include the comma, since it's technically a valid url to have that character at the end. This is arguably undesireable behavior.
      }
    }
  }
  //post book
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

  //nicedice
  if(message.content.toLowerCase().includes('nice dice')){
    message.channel.send("Sponsored by NiceDice™");
  }
  if((result = nicedice.roll(message.content.toLowerCase())).valid){
    console.log("rollin: "+JSON.stringify(message.content.toLowerCase()));
    console.log("rollout: "+JSON.stringify(result));
    message.channel.send(result.value+"\n`"+result.roll_record+"`");
  }

  //extremely dumb features
  //who's that pokemon
  if (/.*wh.*po.?k.?t?\s?mon.*/.test(message.content.toLowerCase())) {
    whos_that_pokemon()
  }
  function fuzzystringmatch(l,r){
    return distance(l,r) < l.length*.75;
  }
  if(pokemon_answers[channel]){
    var target = pokemon_answers[channel].toLowerCase();
    target = target.replace(/[^\(]*\)/g, '').replace(/\(/g, '') || target;
    target = target.replace(/[^a-z]/g, '') || target;
    var guess = message.content.toLowerCase();
    guess = guess.replace(/[^a-z]/g, '') || guess;
    //fuzzy string match
    var normalized_distance = distance(target, guess) / target.length;
    var distance_threshold = .75;
    console.log(guess, normalized_distance); //TODO: remove this after tuning
    if (normalized_distance < distance_threshold){
      channel.send("It's "+pokemon_answers[channel]+"!\nTarget: `"+target+"` Your Guess: `"+guess+"`.\nNormalized Distance (lower is better): "+normalized_distance+" Threshold: "+distance_threshold);
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

//implementation functions

function update_status_clock(){ //This date is extremely precisely formatted for maximum readability in Discord's tiny area, and also familiarity and explicitness to users.
  date = new Date(); //Want to avoid edge cases so we use the same Date object in each format call.
  client.user.setActivity( new Intl.DateTimeFormat('en-US', {timeStyle: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " PT " //time with hard-coded zone. Looks like 4:20 PM PT 
                         + new Intl.DateTimeFormat('en-US', {weekday: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " " //day of week (short name). Looks like Mon 
                         + new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeZone: 'America/Los_Angeles'}).format(date) //date, with day first. Looks like 9 Aug, 2021
                         );
}

function whos_that_pokemon(){
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
  ).on("error", (err) => {console.log(err);whos_that_pokemon();/*retry on error*/});
  req.end();
}

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
