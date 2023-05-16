const Discord = require('discord.js');
const nicedice = require('nicedice');
const {distance, closest} = require('fastest-levenshtein');
const https = require('https');
const fs = require('fs');

const client = new Discord.Client();

{ // THIS BLOCK MUST HAPPEN FOR THE BOT TO LOGIN!
  const BOT_TOKEN = require("./token.json"); //this file is probably missing from your code base, initially, since I have it gitignored, as it is the secret bot token. Never fear! Go to discord and get a bot token of your own, and then put it in a new file called token.json in this directory, surrounding it in quotes to make a javascript string, "like this". That's all!
  client.login(BOT_TOKEN);//BOT_TOKEN is the Client Secret
} //Closing the block scope should thereby destroy the block-scoped BOT_TOKEN constant for the rest of the program. This to make it less likely that we'll accidentally divulge it. I used to just use the `delete` keyword on it, but typescript objected to that for some reason (this may be a javscript strict mode thing? MDN claims it never works, but it worked for me I think ¯\_(ツ)_/¯ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete#description ).
var text = require('./text.json'); //At this time, this is the W. D. Ross 1908 translation of Nicomachean Ethics, as best I can tell.

try{
  // @ts-ignore: I use typescript to check various properties of this javascript file, but one thing typescript complains about constantly is that it can't find these json files. I intentionally have not created these files, for version-control reasons. So, I just have to suppress those errors with these comments.
  var responses = require('./responses.json'); //This provides persistent storage of responses.
} catch {
  var responses = {};
}

try{
  // @ts-ignore: (see previous ts-ignore)
  var server_responses = require('./server_responses.json'); //This provides persistent storage of responses.
} catch {
  var server_responses = {};
}
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
  const m = message.content.toLowerCase();

  if(message.mentions.has(client.user, {ignoreRoles: true, ignoreEveryone: true})){
    if(m.includes("help")){
      channel.send("Need help? Please see <https://github.com/wyattscarpenter/knowledge-lamborghini/> for documentation about my commands. :)");
    }
  }
  //oldify reddit links.
  if ( m.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi) ){
  //here we check if null first to avoid crash on trying to iterate over null. having done that, we actually do the thing:
    for (let r of m.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi ) ){
      //huge character list from https://stackoverflow.com/a/1547940
      //note that it was easier to detect reddit urls and then futz with them each individually than do some crazy capture-jutsu. 
      if (!r.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*old\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi)){ //It's already old reddit, do nothing.
        let target = r.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/([\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*)/ )[1]; // "target" is not here meant to have any precise technical meaning, it's just all the url stuff after the first / (almost, but not quite, a "path").
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
  let nicedice_roll_result = nicedice.roll(m);
  if(nicedice_roll_result.valid){
    console.log("rollin: "+JSON.stringify(m));
    console.log("rollout: "+JSON.stringify(nicedice_roll_result));
    message.channel.send(nicedice_roll_result.value+"\n`"+nicedice_roll_result.roll_record+"`");
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
    let target = pokemon_answers[channel].toLowerCase();
    target = target.replace(/[^\(]*\)/g, '').replace(/\(/g, '') || target;
    target = target.replace(/[^a-z]/g, '') || target;
    let guess = m;
    guess = guess.replace(/[^a-z]/g, '') || guess;
    //fuzzy string match
    let normalized_distance = distance(target, guess) / target.length;
    let distance_threshold = .75; // this tuning seems alright, in terms of false negative to false positive ratio, but the whole experience is still very difficult, which is regrettable
    if (normalized_distance < distance_threshold){
      channel.send("It's "+pokemon_answers[channel]+"!\nTarget: `"+target+"` Your Guess: `"+guess+"`.\nNormalized Distance (lower is better): "+normalized_distance+" Threshold: "+distance_threshold);
      delete pokemon_answers[channel];
    }
  }
  if (m === 'enumerate responses') {
    console.log(responses[channel]);
    send_long( channel, "Channel-specific responses:"+JSON.stringify(responses[channel]) );
    console.log(server_responses[message.guild]);
    send_long( channel, "Server-specific responses:"+JSON.stringify(server_responses[message.guild]) );
  }
  if (m.startsWith("set ")) {
    the_function_that_does_setting_for_responses(message);
  }
  if (m.startsWith("set-probabilistic ")) {
    the_function_that_does_setting_for_responses(message, true);
  }
  if (m.startsWith("set-for-server ")) {
    the_function_that_does_setting_for_responses(message, false, true);
  }
  if (m.startsWith("set-probabilistic-for-server ")) {
    the_function_that_does_setting_for_responses(message, true, true);
  }
  if (responses[channel] && m in responses[channel]) { //guard against empty responses set for this channel
    the_function_that_does_sending_for_responses(message);
  }
  if (server_responses[message.guild] && m in server_responses[message.guild]) { //guard against empty responses set for this channel
    the_function_that_does_sending_for_responses(message, true);
  }
  if (m in global_responses) {
    channel.send(global_responses[m]);
  }
});

//implementation functions

function update_status_clock(){ //This date is extremely precisely formatted for maximum readability in Discord's tiny area, and also familiarity and explicitness to users.
  let date = new Date(); //Want to avoid edge cases so we use the same Date object in each format call.
  if(date.getSeconds()){return false;} //only update with minute resolution, on 00 seconds of each minute (Discord can't handle us using second resolution)
  client.user.setActivity( new Intl.DateTimeFormat('en-US', {timeStyle: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " PT " //time with hard-coded zone. Looks like 4:20 PM PT
                         + new Intl.DateTimeFormat('en-US', {weekday: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " " //day of week (short name). Looks like Mon
                         + new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeZone: 'America/Los_Angeles'}).format(date) //date, with day first. Looks like 9 Aug, 2021
                         );
  return true; //nota bene: the return value indicates if the function decided to update, but I don't use the return value anywhere else in the program so far.
}

function whos_that_pokemon(){
  let req = https.request('https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&format=json',//image
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {data += chunk;});
      resp.on('end', () => {
        let id = JSON.parse(data.match(/"File[\s\S]*"/)[0]);
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
  let s = texts[channel].shift();
  if(s){
    send_long(channel, s);
    if(!intervals[channel]){intervals[channel] = setInterval(think, 1000*60*60*24);} //do it again in a day
  } else {
    stop();
  }
}

function stop_think(){
  clearInterval(intervals[channel]);
  delete intervals[channel];
}

//Could overwrite the original send() 🤔. On the other hand, I could probably just upgrade discord.js to the newest version one of these days, maybe it's fixed there.
function send_long(channel, string){ //.send() Just Fails for messages over discord's 2000 character limit
  for(let l of string.split("\n")){ //break lines into separate messages
    while(l){
      channel.send(l.slice(0,2000)); //note that this is 0-indexed and excludes the specified end character
      l = l.slice(2000); //going over is fine, you know how it is
    }
  }
}

function crash(){
  throw "crash"; //do not catch this, if you really want to crash
}

function is_string(variable){
  return (typeof variable === 'string' || variable instanceof String)
}

function the_function_that_does_setting_for_responses(message, probabilistic=false, for_server=false){
  const response_container = for_server? server_responses : responses;
  const response_container_indexer = for_server? message.guild : message.channel;
  const saving_file_name = for_server? "server_responses.json" : "responses.json";
  let keyword;

  if(probabilistic){
    let command_arguments_text = message.content.split(/\s(.+)/)[1]; // structural diagram: set-probabilistic (blah, (blah , blah blah blah))
    let number = command_arguments_text.split(/\s(.+)/)[0];
    let text_portion = command_arguments_text.split(/\s(.+)/)[1];
    keyword = text_portion.split(/\s(.+)/)[0];
    let response = text_portion.split(/\s(.+)/)[1];
    if(isNaN(number)){ //optional, default to 1 if there's nothing there.
      //shift everything to the right (consider the eg diagram above for a sketch of what this is working on)
      response = text_portion;
      keyword = number;
      number = 1;
    }
    keyword = keyword.toLowerCase(); //lowercase the keyword
    response_container[response_container_indexer] ??= {} //Gotta populate this entry, if need be, with an empty object to avoid an error in assigning to it later
    //Should we replace wholly an existing non-probabilistic response, or make it part of the new possibility range? Here, I've opted for the latter.
    let current_guy = response_container[response_container_indexer][keyword];
    if(is_string(current_guy)){
      response_container[response_container_indexer][keyword] = {[current_guy]: 1}; //the extra square brackets are because it's a computed property: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_colon_after_property_id#computed_properties
    }
    response_container[response_container_indexer][keyword] ??= {}
    response_container[response_container_indexer][keyword][response] = +number ; //note that there isn't presently any way to unset responses. They can be set to 0, however, or perhaps the whole object could be `set` to the empty string. The latter approach also removes it from enumerate responses, which is cool.
  } else {
    const text_portion = message.content.split(/\s(.+)/)[1];
    if(text_portion){ //guard against setting the empty set. not sure if this is needed.
      let thingum = text_portion.split(/\s(.+)/);
      keyword = thingum[0].toLowerCase();
      response_container[response_container_indexer] ??= {} //Gotta populate this entry, if need be, with an empty object to avoid an error in assigning to it in the next line.
      response_container[response_container_indexer][keyword] = thingum[1];
    }
  }
  fs.writeFile(saving_file_name, JSON.stringify(response_container), console.log);
  message.channel.send("OK, "+JSON.stringify(keyword)+" is now set to "+JSON.stringify(response_container[response_container_indexer][keyword]));
}

function the_function_that_does_sending_for_responses(message, for_server=false){
  const response_container = for_server? server_responses : responses;
  const response_container_indexer = for_server? message.guild : message.channel;
  
  const r = response_container[response_container_indexer][message.content.toLowerCase()]; //the response might be a string or an object mapping from strings to weights.
  if(is_string(r)){
    console.log("string response", r);
    r && message.channel.send(r); //guard against sending an empty string (which is a crashing error for us... maybe fix that with a wrapping function later?)
  } else {
    console.log("random response", r);
    //Pick by weighted randomness
    //Implicitly, the type of r is object mapping from string → int, with each int being the number of "tickets" the string has in the "raffle", so to speak.
    let cumulative_weights = [];
    for(const key of Object.keys(r)){
      cumulative_weights.push( (+r[key]||1) + (+cumulative_weights.at(-1)||0) );
    }
    const random = Math.random() * cumulative_weights.at(-1);
    console.log("random number", random, "cumulative_weights", cumulative_weights);
    for(const key of Object.keys(r)){
      if (random - cumulative_weights.shift() <= 0) {
        key && message.channel.send(key);
        break;
      }
    }
  }
}
