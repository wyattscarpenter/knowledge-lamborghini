const { Client, Intents } = require('discord.js');
const nicedice = require('nicedice');
const {distance, closest} = require('fastest-levenshtein');
const chrono = require('chrono-node');
const https = require('https');
const fs = require('fs');

const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT]} );

// THIS LINE MUST HAPPEN FOR THE BOT TO LOGIN:
client.login(require("./token.json"));//this file is probably missing from your code base, initially, since I have it gitignored, as it is the secret bot token. Never fear! Go to discord and get a bot token of your own, and then put it in a new file called token.json in this directory, surrounding it in quotes to make a javascript string, "like this". That's all!

/** @type string[] */
let text = require('./text.json'); //At this time, this is Book 1 of the W. D. Ross 1908 translation of Nicomachean Ethics, as best I can tell.

function try_require(require_id, default_value){ // require_id is a bit baroque, but the most simple case is ./local_file_name https://nodejs.org/api/modules.html#requireid
  try{ return require(require_id); } catch (e) {console.log(`${e.message.split('\n')[0]} — ${require_id} not found (or errored horribly), using default value ${JSON.stringify(default_value)}`); return default_value; }
}

//These provide persistent storage of responses. Could collect them all into one file, someday, if I keep making new ones that take up space but do the same thing... (this would, however, incur more writes for more data).
let responses = try_require("./responses.json", {});
let server_responses = try_require('./server_responses.json', {});
let remindmes = try_require('./remindmes.json',[]); //This loads the remindmes into the authoritative data structure, but we can't actually do anything with them (ie launch them) until the bot is ready, because we might need to discharge them by sending messsages.
//The type of track_leaves an object mapping from guildIds to arrays of channelIds. That is, { [key: string]: string; } in typescript.
/** @type {{ [guildId: string]: string[] }} */
let track_leaves = try_require('./track_leaves.json', {});

let texts = {};
let channel;
var think_intervals = {};
var pokemon_answers = {};
const global_responses = {"hewwo": "perish", "good bot": "Don't patronize me."};


client.on('ready', () => {
  console.log('I am ready! Logged in as '+client.user.tag);
  setInterval(update_status_clock, 1000);
  launch_remindmes(remindmes);
});

client.on('guildMemberRemove', member => { //"Emitted whenever a member leaves a guild, or is kicked."
  if ( track_leaves[member.guild.id] ) {
    for (const channelId of track_leaves[member.guild.id]){
      client.channels.fetch(channelId).then(channel => channel.isText() && channel.send(
        member.user.toString()+" ("+member.user.tag+", id `"+member.user.id+"`)"+" is removed from the server (left or kicked)."
      ));
    }
  }
});

client.on('messageCreate', message => {
  if (message.author.bot){return;} //don't let the bot respond to its own messages
  if (!message.content){return;} //don't even consider empty messages

  channel = message.channel;
  const m = message.content.toLowerCase();

  if(message.mentions.has(client.user, {ignoreRoles: true, ignoreEveryone: true})){
    if(m.includes("help")){
      channel.send("Need help? Please see <https://github.com/wyattscarpenter/knowledge-lamborghini/> for documentation about my commands. :)");
    }
  }
  //To oldify reddit links.
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
  //To post book
  if (m === 'think!') {
    if(texts[channel.id]===undefined){
      texts[channel.id] = text.slice(); //Populate the text to begin with, for the channel. A shallow copy is fine for this.
    }
    if(texts[channel.id].length){
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

  //Track members leaving a server
  if (m.startsWith('death has many doors')) {
    if ( track_leaves[message.guild.id] ){
      track_leaves[message.guild.id].push(message.channel.id);
    } else {
      track_leaves[message.guild.id] = [message.channel.id];
    }
    fs.writeFile("track_leaves.json", JSON.stringify(track_leaves), console.log); //update record on disk
    message.reply("A record will be kept here.");
  }
  if (m.startsWith('death has no doors')) {
    if ( track_leaves[message.guild.id] ){
      track_leaves[message.guild.id] = array_but_without(track_leaves[message.guild.id], message.channel.id);
    }
    fs.writeFile("track_leaves.json", JSON.stringify(track_leaves), console.log); //update record on disk
    message.reply("No record will be kept here.");
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
  if(pokemon_answers[channel.id]){
    let target = pokemon_answers[channel.id].toLowerCase();
    target = target.replace(/[^\(]*\)/g, '').replace(/\(/g, '') || target;
    target = target.replace(/[^a-z]/g, '') || target;
    let guess = m;
    guess = guess.replace(/[^a-z]/g, '') || guess;
    //fuzzy string match
    let normalized_distance = distance(target, guess) / target.length;
    let distance_threshold = .75; // this tuning seems alright, in terms of false negative to false positive ratio, but the whole experience is still very difficult, which is regrettable
    if (normalized_distance < distance_threshold){
      channel.send("It's "+pokemon_answers[channel.id]+"!\nTarget: `"+target+"` Your Guess: `"+guess+"`.\nNormalized Distance (lower is better): "+normalized_distance+" Threshold: "+distance_threshold);
      delete pokemon_answers[channel.id];
    }
  }
  if (m.startsWith("remindme ")) {
    set_remindme(message);
  }
  if (m === 'enumerate responses') {
    console.log(responses[channel.id]);
    send_long( channel, "Channel-specific responses:"+JSON.stringify(responses[channel.id]) );
    console.log(server_responses[message.guild.id]);
    send_long( channel, "Server-specific responses:"+JSON.stringify(server_responses[message.guild.id]) );
  }
  if (m.startsWith("set-for-channel ")) {
    the_function_that_does_setting_for_responses(message);
  }
  if (m.startsWith("set-probabilistic-for-channel ")) {
    the_function_that_does_setting_for_responses(message, true);
  }
  if (m.startsWith("set-for-server ") || m.startsWith("set ")) {
    the_function_that_does_setting_for_responses(message, false, true);
  }
  if (m.startsWith("set-probabilistic-for-server ") || m.startsWith("set-probabilistic ")) {
    the_function_that_does_setting_for_responses(message, true, true);
  }
  if (responses[channel.id] && m in responses[channel.id]) { //guard against empty responses set for this channel
    the_function_that_does_sending_for_responses(message);
  }
  if (server_responses[message.guild.id] && m in server_responses[message.guild.id]) { //guard against empty responses set for this channel
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
        pokemon_answers[channel.id] = id.match(/File:(.*)\.\w*?$/)[1];
        console.log(pokemon_answers[channel.id]); //console.log answer so I can cheat-- er, I mean, test.
      });
    }
  ).on("error", (err) => {console.log(err);whos_that_pokemon();/*retry on error*/});
  req.end();
}

function think(){
  let s = texts[channel.id].shift();
  if(s){
    send_long(channel, s);
    if(!think_intervals[channel.id]){ //This clause handles the difference between a guy saying Think! for the first time, and a guy spamming Think!. It ensures there will be no great think-spam the next day as well.
      think_intervals[channel.id] = setInterval(think, 1000*60*60*24); //do it again in a day
    }
  } else {
    clearInterval(think_intervals[channel.id]); //purposefully, I do not delete the entry for the channel, prevent it, for now, from being re-Think!ed. Then it can mutter its cool quip for the end of the text when prompted.
  }
}

function stop_think(){
  clearInterval(think_intervals[channel.id]);
  delete think_intervals[channel.id]; //purposefully, I delete the entry for the channel, to allow it to be re-Think!ed
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
  const response_container_indexer = for_server? message.guild.id : message.channel.id;
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
  const response_container_indexer = for_server? message.guild.id : message.channel.id;
  
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
      cumulative_weights.push( (+r[key]||0) + (+cumulative_weights.at(-1)||0) );
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

function discord_timestamp(date, is_relative=false){
  return "<t:"+ Math.trunc(+date/1000) + (is_relative? ":R>" : ">"); //there are other types of discord timestamps but we needn't bother with them here.
}

function set_remindme(message){
  const command_arguments_text = message.content.split(/\s(.+)/)[1]; //this just filters out the "remindme " portion. The text does not need to be further split, because the date parser is fine taking extra text.
  const d = chrono.parseDate(command_arguments_text);
  if(!d){
    message.reply("You have used the remindme command with argument `"+command_arguments_text+"`, but I can't understand the date you've tried to specify. I think it's `"+ d + "` My date parsing handles a lot of natural language, but it's not perfect. Try a different tack?");
  } else if (d<=new Date()){ //Because the computer operates with variable speed(?) d<now is SOMETIMES true if you've declared d to be now. But d<=now is ALWAYS true, so we use it for greater consistency.
    message.reply("You have used the remindme command with argument `"+command_arguments_text+"`, but I think you're trying to specify the date `"+ d +"`, which is "+discord_timestamp(d)+" ie "+discord_timestamp(d, true)+". I think this is in the past, and I cannot retroactively remind you of things! Please try a different time specification if need be.");
  } else {
    message.reply("OK! You have used the remindme command with argument `"+command_arguments_text+"`.\n\nOn the date `"+ d +"`, which is "+discord_timestamp(d)+" ie "+discord_timestamp(d, true)+", I will reply to your comment and quote back your message to you—assuming this bot and this channel are still around by then!");
    //Add a remindme, making sure to commit it to the authoritative data structure, and cache that structure to file:
    const remindme = {datestamp: +d, message: message};
    remindmes.push(remindme);
    fs.writeFile("remindmes.json", JSON.stringify(remindmes), console.log); //update record on disk
    launch_remindmes([remindme]);
  }
}

function launch_remindmes(remindmes){
  const workaround_wait_ms = 2000000000; // 147,483,647 less than the s32-int-max.
  for (const remindme of remindmes) {
    const now = +(new Date());
    if (remindme.datestamp<=now){ //The correct time may have happened whilst the bot was sleeping or doing other work, and frankly I don't know what setTimeout is specified to do for negative values.
      discharge_remindme(remindme);
    } else if (remindme.datestamp - now > workaround_wait_ms) { //setTimeout takes as a delay parameter a signed-32-bit integer, so we have to work around that. We just delay an arbitrary but manageable amount of time here. This shouldn't cause any problems, because it doesn't mess with the global remindmes data structure, which is authoritative. I worry about the performance implications of these timeouts all returning at the same time, possibly in the middle of something else, but it should be fine.
      setTimeout(launch_remindmes, workaround_wait_ms, [remindme]); //This kicks this particular can about 24 days down the road.
    } else {
      setTimeout(discharge_remindme, remindme.datestamp - now, remindme); //BUG: setTimeout can only take a s32. Have to work around it.
    }
  }
}

function discharge_remindme(remindme){ //Send a remindme, making sure to remove it from the authoritative data structure, and cache that structure to file:
  //The method to send this is slightly convoluted, since we lose the method-state by which we would do it simply on bot-reboot.
  client.channels.fetch(remindme.message.channelId).then(channel => channel.isText() && channel.send( //the isText is purely to appease the typescript typechecker; it should always be superfluous.
    { content: "It is time:\n"+remindme.message.content, reply: {messageReference: remindme.message.id} }
  ));
  remindmes = remindmes.filter(item => item !== remindme) //remove the remindme from the global list
  fs.writeFile("remindmes.json", JSON.stringify(remindmes), console.log); //update record on disk
}

function array_but_without(array, undesirable_item) { return array.filter(item => item !== undesirable_item); } // This function is just because javascript lacks a .remove() function on arrays. It is NOT in-place, you have to assign it to the original array if you want that. I thought about extending the array prototype to add a .remove(), but this sets up a footgun for for-in loops (which I never use, for that reason, but may slip up about some day).