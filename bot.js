const Discord = require('discord.js');
const nicedice = require('nicedice');
const {distance, closest} = require('fastest-levenshtein');
const https = require('https');
const fs = require('fs');

const client = new Discord.Client();

const BOT_TOKEN = require("./token.json"); 
var text = require('./text.json'); //At this time, this is the W. D. Ross 1908 translation of Nicomachean Ethics, as best I can tell.
var responses = require('./responses.json'); //This provides persistent storage of responses. Unless, of course, your file system were to randomly restart and wipe on a periodic basis. Oh ho ho, what a wacky and unrealistic notion, surely not in practice by any of the services I use to host KL! (Narrator voice: but they did in fact have this operating policy.)
var texts = {};
var channel;
var intervals = {};
var global_responses = {"hewwo": "perish", "good bot": "Don't patronize me."};
var pokemon_answers = {};

client.on('ready', () => {
  console.log('I am ready!');
  setInterval(update_status_clock, 1000);
});

client.on('message', message => {
  if (message.author.bot){return;} //don't let the bot respond to its own messages
  if (!message.content){return;} //don't even consider empty messages
  
  channel = message.channel;
  var m = message.content.toLowerCase();

  if(message.mentions.has(client.user, {ignoreRoles: true, ignoreRepliedUser: true, ignoreEveryone: true})){
    channel.send("You @ me? I'm at your service. Please see <https://github.com/wyattscarpenter/knowledge-lamborghini/> for documentation about my commands. :)");
  }
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
  if (m === 'think!') {
    if(texts[channel]===undefined){
      begin_think();
    }
    if(texts[channel].length){
      think();
    }else{
      channel.send("Demand me nothing. What you know, you know.");
    }  
  }
  if (m === 'stop!') {
    stop_think();
  }
  
  if (m === 'crash') {
    console.log("triggering crash in this program");
    channel.send("I'm crashing ova heya! [crashes]").then(crash);
  }

  //nicedice
  if(m.includes('nice dice')){
    message.channel.send("Sponsored by NiceDice™");
  }
  if((result = nicedice.roll(m)).valid){
    console.log("rollin: "+JSON.stringify(m));
    console.log("rollout: "+JSON.stringify(result));
    message.channel.send(result.value+"\n`"+result.roll_record+"`");
  }

  //extremely dumb features
  //who's that pokemon
  if (/.*wh.*po.?k.?t?\s?mon.*/.test(m)) {
    whos_that_pokemon()
  }
  function fuzzystringmatch(l,r){
    return distance(l,r) < l.length*.75;
  }
  if(pokemon_answers[channel]){
    var target = pokemon_answers[channel].toLowerCase();
    target = target.replace(/[^\(]*\)/g, '').replace(/\(/g, '') || target;
    target = target.replace(/[^a-z]/g, '') || target;
    var guess = m;
    guess = guess.replace(/[^a-z]/g, '') || guess;
    //fuzzy string match
    var normalized_distance = distance(target, guess) / target.length;
    var distance_threshold = .75; // this tuning seems alright, in terms of false negative to false positive ratio, but the whole experience is still very difficult, which is regrettable
    if (normalized_distance < distance_threshold){
      channel.send("It's "+pokemon_answers[channel]+"!\nTarget: `"+target+"` Your Guess: `"+guess+"`.\nNormalized Distance (lower is better): "+normalized_distance+" Threshold: "+distance_threshold);
      delete pokemon_answers[channel];
    }
  }
  if (m.startsWith("set ")) {
    text_portion = m.split(/\s(.+)/)[1];
    if(text_portion){ //guard against setting the empty set. not sure if this is needed.
      thingum = text_portion.split(/\s(.+)/);
      responses[channel] ??= {} //Gotta populate this entry, if need be, with an empty object to avoid an error in assigning to it in the next line.
      responses[channel][thingum[0]] = thingum[1];
      fs.writeFile("responses.json", JSON.stringify(responses), console.log);
    }
  }
  if (m.startsWith("set-probabilistic ")) {
    command_arguments_text = m.split(/\s(.+)/)[1];
    number = command_arguments_text.split(/\s(.+)/)[0];
    text_portion = command_arguments_text.split(/\s(.+)/)[1];
    keyword = text_portion.split(/\s(.+)/)[0];
    response = text_portion.split(/\s(.+)/)[1];
    
    if(isNaN(number)){
      channel.send("`set-probabilistic` requires a valid number as its second argument to be its weight, then the keyword, then the response. This, you have failed to provide.");
    } else {
      responses[channel] ??= {} //Gotta populate this entry, if need be, with an empty object to avoid an error in assigning to it later
      //Should we replace wholly an existing non-probabilistic response, or make it part of the new possibility range? Here, I've opted to delete it.
      if(is_string(responses[channel][keyword])){
        delete responses[channel][keyword];
      }
      responses[channel][keyword] ??= {}
      responses[channel][keyword][response] = number ; //note that there isn't presently any way to unset responses. They can be set to 0, however, or perhaps the whole object could be `set` to the empty string.

      fs.writeFile("responses.json", JSON.stringify(responses), console.log);
    }
  }
  if (responses[channel] && m in responses[channel]) { //guard against empty responses set for this channel
    const r = responses[channel][message.content]; //the response. might be a string or an object mapping from strings to weights.
    if(is_string(r)){
      r && channel.send(r); //guard against sending an empty string (which is a crashing error for us... maybe fix that with a wrapping function later?)
    } else {
      //pick by weighted randomness
      //implicitly, the type is object mapping from string → int, with each int being the number of "tickets" the string has in the "raffle", so to speak.
      var cumulative_weights = [];
      for(const key of Object.keys(r)){
        cumulative_weights.push(r[key]||1 + cumulative_weights.at(-1)||0);
      }
      const random = Math.random() * cumulative_weights.at(-1);
      for(const key of Object.keys(r)){
        if (random - cumulative_weights.shift() <= 0) {
          key && channel.send(key);
          break;
        }
      }
    }
  }
  if (m in global_responses) {
    channel.send(global_responses[message.content]);
  }
});

//implementation functions

function update_status_clock(){ //This date is extremely precisely formatted for maximum readability in Discord's tiny area, and also familiarity and explicitness to users.
  date = new Date(); //Want to avoid edge cases so we use the same Date object in each format call.
  if(date.getSeconds()){return false;} //only update with minute resolution, on 00 seconds of each minute (Discord can't handle us using second resolution)
  client.user.setActivity( new Intl.DateTimeFormat('en-US', {timeStyle: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " PT " //time with hard-coded zone. Looks like 4:20 PM PT 
                         + new Intl.DateTimeFormat('en-US', {weekday: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " " //day of week (short name). Looks like Mon 
                         + new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeZone: 'America/Los_Angeles'}).format(date) //date, with day first. Looks like 9 Aug, 2021
                         );
  return true; //nota bene: the return value indicates if the function decided to update, but I don't use the return value anywhere else in the program so far.
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
    for(var l of s.split("\n")){ //break lines into separate messages
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

function crash(){
  throw "crash"; //do not catch this, if you really want to crash
}

function is_string(variable){
  return (typeof variable === 'string' || variable instanceof String)
}

// THIS MUST BE THIS WAY
client.login(BOT_TOKEN);//BOT_TOKEN is the Client Secret
delete BOT_TOKEN; //delete this to make it less likely that we'll accidentally divulge it
