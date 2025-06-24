// @ts-check //This instructs typescript to also check this file, and provide diagnostics, in vscode. I also have `"js/ts.implicitProjectConfig.checkJs": true` in my user `settings.json`, which does the same thing for all js files.
const { Client, Events, GatewayIntentBits, ChannelType, MessagePayload, Partials} = require('discord.js');
const nicedice = require('nicedice');
const {distance} = require('fastest-levenshtein');
const chrono = require('chrono-node');
const https = require('https');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Reaction],
});

const kl_test_emoji_id = "1342850037792772106" //this is a test emoji I created when we need to test an emoji feature. //somehow, this test emoji feature, but not the actual feature, does not work on the production deployment, although it does work on my local deployment of the same exact code. Very odd. I'm not even going to mark this as a task to fix because I have no idea how nor what's even wrong.

// THIS LINE MUST HAPPEN FOR THE BOT TO LOGIN:
client.login(require("./token.json"));//this file is probably missing from your code base, initially, since I have it gitignored, as it is the secret bot token. Never fear! Go to discord and get a bot token of your own, and then put it in a new file called token.json in this directory, surrounding the token in quotes to make a javascript string, "like this". That's all!

/** @type string[] */
let text = require('./text.json'); //At this time, this is Book 1 of the W. D. Ross 1908 translation of Nicomachean Ethics, as best I can tell.

function error_message_first_line_if_error(e){
  if (e instanceof Error) {
    const error_message = e.message.split('\n')[0];
  } else {
    const error_message = e;
  }
}

function try_require(require_id, default_value){ // require_id is a bit baroque, but the most simple case is ./local_file_name https://nodejs.org/api/modules.html#requireid
  try{
    return require(require_id);
  } catch (e) {
    console.log(`I could not find ${require_id} (or perhaps it errored horribly), so I am using the specified default value ${JSON.stringify(default_value)}, which should be fine. Original error message first line: ${error_message_first_line_if_error(e)}`);
    return default_value;
  }
}

//These provide persistent storage of responses. Could collect them all into one file, someday, if I keep making new ones that take up space but do the same thing... (this would, however, incur more writes for more data).
let responses = try_require("./responses.json", {});
let server_responses = try_require('./server_responses.json', {});
let remindmes = try_require('./remindmes.json', []); //This loads the remindmes into the authoritative data structure, but we can't actually do anything with them (ie launch them) until the bot is ready, because we might need to discharge them by sending messsages.
//The type of track_leaves is an object mapping from guildIds to arrays of channelIds. That is, { [key: string]: string[]; } in typescript.
/** @type {{ [guildId: string]: string[] }} */
let track_leaves = try_require('./track_leaves.json', {});
//The type of starboards is (TODO) an object mapping from guildIds to an object mapping from channelIds to messageIds (of already-included messages). 
//Maybe one day this should also map to an integer that is the cutoff for the number of reactions needed to forward to the starboard.
/** @type {{ [guildId: string]: string[] }} */
let starboards = try_require('./starboards.json', {});
/** @type string */
const version_number = require('./package.json').version;
/** @type string */
const git_commit_hash = (() => {
  //This gets us the git commit hash, assuming you're on branch master, which we assume. Unfortunately, this doesn't get you the commit message, but this is an easy 80% solution.
  try {
    return fs.readFileSync(".git/refs/heads/master").toString().trim();
  } catch (e) {
    return `unknown ( ${error_message_first_line_if_error(e)} )`;
  }
})()
/** @type string */
const version_string = "Version "+version_number+", git commit "+git_commit_hash;

let texts = {};
var think_intervals = {};
var pokemon_answers = try_require("./pokemon_answers.json", {});
const global_responses = {"hewwo": "perish", "good bot": "Don't patronize me."};


client.on('ready', () => {
  console.log('I am ready! Logged in as '+client.user?.tag);
  setInterval(update_status_clock, 1000);
  launch_remindmes(remindmes);
});

client.on(Events.GuildMemberRemove, member => { //"Emitted whenever a member leaves a guild, or is kicked."
  if ( track_leaves[member.guild.id] ) {
    for (const channelId of track_leaves[member.guild.id]){
      client.channels.fetch(channelId).then( channel => {
        if (channel === null || channel.type !== ChannelType.GuildText) {
          console.log("channel I wanted to tell about a member leaving was null or not a GuildText, which is surprising, and I can't send the message.");
          console.log(channel, member.guild, member.user.toString())
          return;
        }
        channel.send(
          member.user.toString()+" ("+member.user.tag+", id `"+member.user.id+"`)"+" is gone from the server (left, kicked, or banned)."
        )
      }
      );
    }
  }
});

const remindme_regex = /^!? ?remind ?me ?!?/i;
const howlongago_regex = /^!? ?how ?long ?ago ?!? ?w?a?i?s? ?!?/i;

client.on(Events.MessageCreate, message => {
  if (message.author.bot){return;} //don't let the bot respond to its own messages
  if (!message.content){return;} //don't even consider empty messages
  if (!message.guild){return;} //don't consider... uh... I guess this is DMs? IDK I just got a warning from typescript.
  const channel = message.channel;
  const m = message.content.toLowerCase();

  if (client.user !== null){ //apparently this could be null. So, guard against that.
    if(message.mentions.has(client.user, {ignoreRoles: true, ignoreEveryone: true})){
      if(m.includes("version")){
        channel.send(version_string);
      }
      if(m.includes("help")){
        channel.send("Need help? Please see <https://github.com/wyattscarpenter/knowledge-lamborghini/> for documentation about my commands. :)");
      }
    }
  }
  //To oldify reddit links.
  // Here we "check" if null, using ??, to avoid crash on trying to iterate over null. having done that, we actually do the thing:
  for (let r of m.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi ) ?? [] ){
    //huge character list from https://stackoverflow.com/a/1547940
    //note that it was easier to detect reddit urls and then futz with them each individually than do some crazy capture-jutsu. 
    if (!r.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*old\.?reddit\.com\/[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*/gmi)){ //It's already old reddit, do nothing.
      const little_match = r.match( /[\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*\.?reddit\.com\/([\w\-.~:\/?#\[\]@!$&'\(\)\*+,;%=]*)/ )
      if (little_match === null) {
        console.log("little_match of the reddit link was null, which I didn't even think was possible. Logging this message and returning early...");
        return;
      }
      const target = little_match[1]; // "target" is not here meant to have any precise technical meaning, it's just all the url stuff after the first / (almost, but not quite, a "path").
      channel.send("<https://old.reddit.com/"+target+">"); //note that urls followed by eg a comma might include the comma, since it's technically a valid url to have that character at the end. This is arguably undesireable behavior.
    }
  }
  
  //To post book
  if (m === 'think!') {
    if(texts[channel.id]===undefined){
      texts[channel.id] = text.slice(); //Populate the text to begin with, for the channel. A shallow copy is fine for this.
    }
    if(texts[channel.id].length){
      think(channel);
    }else{
      channel.send("Demand me nothing. What you know, you know.");
    }
  }
  if (m === 'stop!') {
    stop_think(channel);
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
    fs.writeFile("track_leaves.json", JSON.stringify(track_leaves), console_log_if_not_null); //update record on disk
    message.reply("A record will be kept here.");
  }
  if (m.startsWith('death has no doors')) {
    if ( track_leaves[message.guild.id] ){
      track_leaves[message.guild.id] = array_but_without(track_leaves[message.guild.id], message.channel.id);
    }
    fs.writeFile("track_leaves.json", JSON.stringify(track_leaves), console_log_if_not_null); //update record on disk
    message.reply("No record will be kept here.");
  }

  //Track starboard-type functionality
  if (m.startsWith('keep a starboard here')) {
    if ( starboards[message.guild.id] ){
      starboards[message.guild.id].push(message.channel.id);
    } else {
      starboards[message.guild.id] = [message.channel.id];
    }
    fs.writeFile("starboards.json", JSON.stringify(starboards), console_log_if_not_null); //update record on disk
    message.reply("A starboard will be kept here.");
  }
  if (m.startsWith("don't keep a starboard here")) {
    if ( starboards[message.guild.id] ){
      starboards[message.guild.id] = array_but_without(starboards[message.guild.id], message.channel.id);
    }
    fs.writeFile("starboards.json", JSON.stringify(starboards), console_log_if_not_null); //update record on disk
    message.reply("No starboard will be kept here.");
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
    whos_that_pokemon(channel, message.url)
  }
  if(pokemon_answers[channel.id]){
    let target = pokemon_answers[channel.id].answer.toLowerCase();
    target = target.replace(/[^\(]*\)/g, '').replace(/\(/g, '') || target;
    target = target.replace(/[^a-z]/g, '') || target;
    let guess = m;
    guess = guess.replace(/[^a-z]/g, '') || guess;
    //fuzzy string match
    let normalized_distance = distance(target, guess) / target.length;
    let distance_threshold = .75; // This tuning seems alright, in terms of false negative to false positive ratio, but the whole experience is still very difficult, which is regrettable.
    if (normalized_distance < distance_threshold){
      channel.send(
        "[It's]("+pokemon_answers[channel.id].original_message_link+") "+pokemon_answers[channel.id].answer+"!\n" +
        "Target: `"+target+"` Your Guess: `"+guess+"`.\n" +
        "Normalized Distance (lower is better): "+normalized_distance+" Threshold: "+distance_threshold
      );
      delete pokemon_answers[channel.id];
      fs.writeFile("pokemon_answers.json", JSON.stringify(pokemon_answers), console_log_if_not_null); //update record on disk
    }
  }
  if (remindme_regex.test(m)) {
    set_remindme(message);
  }
  if (howlongago_regex.test(m)) {
    howlongago(message);
  }

  if (m === 'enumerate responses') {
    console.log(responses[channel.id]);
    send_long( channel, "Channel-specific responses: "+pretty_string(responses[channel.id]) );
    console.log(server_responses[message.guild.id]);
    send_long( channel, "Server-specific responses: "+pretty_string(server_responses[message.guild.id]) );
  }
  if (m.startsWith("set-for-channel ")) {
    the_function_that_does_setting_for_responses(message, false);
  }
  if (m.startsWith("set-for-server ") || m.startsWith("set ")) {
    the_function_that_does_setting_for_responses(message, true);
  }
  if (m.startsWith("unset-for-channel ")) {
    the_function_that_does_setting_for_responses(message, false, true);
  }
  if (m.startsWith("unset-for-server ") || m.startsWith("unset ")) {
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

  const brazilmatch = message.content.match(/^!? ?to ?bras?z?il ?(.*)$/i)
  if (brazilmatch) {
    console.log("tobrazil");
    console.log(message.content);
    channel.send("🇧🇷\n\n\n     " + brazilmatch?.[1] + "\n\n\n               🏌️‍♂️");
  }

  if (/^!?yud!?$/i.test(m)) {
    channel.send("Yud status: " + random_choice([
      "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 All yuds operational.",
      "short", "long", "medium", "wide", "narrow", "thin", "slender", "chunky",
      "chonky", "slimthick", "slimthicc", "slimthiccc", "slimthic", "thic",
      "thicc", "thiccc", "think", "*Aah!*", "murky", "ponderous", "profound",
      "small", "minuscule", "miniscule", "majuscule", "majestic", "smol",
      "extra large", "ok", "not doing ok :slight_frown:", "rough", "livid",
      "lively", "sauntering", "a legend", "pentakill", "*Aaargh!!!*", "a'ight",
      "thiiiiiiiiiiiiiiiiiiiiiiiiiiis much", "long long", "unsigned long long"
    ]) + ".");
  }

  if (/joh?na?t?h?a?n? ?frakes\??/i.test(m)) {
    channel.send(random_choice([
      "Have you ever walked out of a mall into a huge parking area and realized you’d forgotten where you parked your car?",
      "Ever gone mountain biking?",
      "What do you want to be when you grow up?",
      "Have you called a plumber to your home lately?",
      "How superstitious are you?",
      "How much money would it take to make you spend a night in a cemetery?",
      "Do you have a sweet tooth?",
      "Do you believe in the power of a curse?",
      "Have you had your hearing tested lately?",
      "Planning a trip soon?",
      "Can you remember the tallest man you’ve ever seen?",
      "Do you love to go a-wanderin’ beneath a clear blue sky?",
      "Have you noticed what big stars real estate agents have become?",
      "Are you careful with your personal records?",
      "Have you ever visited a Chinatown section in a major city?",
      "Have you ever visited a flea market?",
      "Ever visited a truck stop?",
      "Did you ever have a job as a waiter?",
      "Have you noticed how many successful restaurants are theme-based these days?",
      "Have you ever had the desire to write your initials in wet cement?",
      "Have you ever danced with the devil in the pale moonlight?", // Easter egg; this one is actually from Batman.
    ]));
  }
  if (/^!?frakes\??/i.test(m)) {
    channel.send(random_choice([
      "https://www.youtube.com/watch?v=MCT80HJWQ2A", // jonathan frakes telling you you're right for 41 seconds
      "https://www.youtube.com/watch?v=9S1EzkRpelY", // Jonathan Frakes Asks You Things //this is also the one the "jonathan frakes" responses are drawn from
      "https://www.youtube.com/watch?v=GxPSApAHakg", // Jonathan Frakes Interrogates You
      "https://www.youtube.com/watch?v=n-NnxdZqPOE", // Jonathan Frakes Interrogates You With Nonsense 
      "https://www.youtube.com/watch?v=XPEKayKHwXA", // Commander Riker (Jonathan Frakes) Telling Us It's Fake 
      "https://www.youtube.com/watch?v=GM-e46xdcUo", // jonathan frakes telling you you're wrong for 47 seconds //the one that started it all :wistful:
    ]));
  }
});

//implementation functions

function pretty_string(object){
  return JSON.stringify(object, null, 4);
}

function random_choice(array){
  const a = array;
  const n = Math.floor(Math.random() * a.length);
  return a[n];
}

function update_status_clock(){ //This date is extremely precisely formatted for maximum readability in Discord's tiny area, and also familiarity and explicitness to users.
  let date = new Date(); //Want to avoid edge cases so we use the same Date object in each format call.
  if(date.getSeconds()){return false;} //only update with minute resolution, on 00 seconds of each minute (Discord can't handle us using second resolution)
  if(!client.user){return false;} // I guess this could be null sometimes somehow.
  client.user.setActivity( new Intl.DateTimeFormat('en-US', {timeStyle: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " PT " //time with hard-coded zone. Looks like 4:20 PM PT
                         + new Intl.DateTimeFormat('en-US', {weekday: 'short', timeZone: 'America/Los_Angeles'}).format(date) + " " //day of week (short name). Looks like Mon
                         + new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeZone: 'America/Los_Angeles'}).format(date) //date, with day first. Looks like 9 Aug, 2021
                         );
  return true; //nota bene: the return value indicates if the function decided to update, but I don't use the return value anywhere else in the program so far.
}

function whos_that_pokemon(channel, original_message_link){
  let req = https.request('https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&format=json',//image
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {data += chunk;});
      resp.on('end', () => {
        const filey_match = data.match(/"File[\s\S]*"/);
        if (filey_match === null){
          console.log("filely_match of the 'pokemon' file name was null, which I didn't even think was possible. Logging this message and returning early...");
          return;
        }
        const id = JSON.parse(filey_match[0]);
        channel.send({
          files:[{
            attachment: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/"+encodeURIComponent(id),
            name: 'pokemon'+id.match(/\.\w*?$/)[0].toLowerCase()
          }]
        });
        //Technically I guess the original_message_link should be what we get returned from channel.send, .url, but that's more trouble than it's worth, so we just use the message that triggered us instead.
        pokemon_answers[channel.id] = {answer: id.match(/File:(.*)\.\w*?$/)[1], original_message_link: original_message_link}
        console.log(pokemon_answers[channel.id]); //console.log answer so I can cheat-- er, I mean, test.
        fs.writeFile("pokemon_answers.json", JSON.stringify(pokemon_answers), console_log_if_not_null); //update record on disk
      });
    }
  ).on("error", (err) => { /*retry on error*/
    console.log(err);
    whos_that_pokemon(channel, original_message_link);
  });
  req.end();
}

function think(channel){
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

function stop_think(channel){
  clearInterval(think_intervals[channel.id]);
  delete think_intervals[channel.id]; //purposefully, I delete the entry for the channel, to allow it to be re-Think!ed
}

function send_long(channel, string){ //.send() Just Fails for messages over discord's 2000 character limit, and discordjs is not going to fix this.
  for(let l of string.split("\n\n")){ //break lines into separate messages if they're separated by two newlines
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
  return (typeof variable === 'string')
}

function the_function_that_does_setting_for_responses(message, for_server=false, unset=false){
  const response_container = for_server? server_responses : responses;
  const response_container_indexer = for_server? message.guild.id : message.channel.id;
  const saving_file_name = for_server? "server_responses.json" : "responses.json";

  // Rough structural diagram of input we're parsing: set (blah, (blah , blah blah blah))
  const command_arguments_text = message.content.split(/\s(.+)/)[1];
  const [first_argument, rest_arguments] = command_arguments_text.split(/\s(.+)/);
  const [number, keyWord, response] = unset? //The number parameter is not allowed for the unset commands, so there is no need to search further.
      [0, first_argument, rest_arguments] // 0 is simply a dummy value here, since we don't actually need this number for this route
    : isNaN(first_argument)?  //optional, default number to 1 if there's nothing there.
      [1, first_argument, rest_arguments]
    :
      [+first_argument].concat(rest_arguments.split(/\s(.+)/)) //this is a silly way to write it but hey we need to structure it to destructure it!
  ;
  const keyword = keyWord.toLowerCase();
  response_container[response_container_indexer] ??= {}; //Gotta populate this entry, if need be, with an empty object to avoid an error in assigning to it later

  //For LEGACY JSONs with an existing non-probabilistic response, we make it part of the new possibility range.
  let current_guy = response_container[response_container_indexer][keyword];
  if(is_string(current_guy)){
    response_container[response_container_indexer][keyword] = {[current_guy]: 1}; //the extra square brackets are because it's a computed property: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_colon_after_property_id#computed_properties
  }
  const attachments = Array.from(message.attachments.values()).flatMap(x => x.attachment);
  const rs = response? [response].concat(attachments) : attachments;
  if (unset) {
    if (rs.length) { //did you know empty arrays are truey in javascript? even though empty strings are falsey? Curious.
      for (const r of rs) {
        if (response_container[response_container_indexer][keyword]) { //we will get a "TypeError: Cannot convert undefined or null to object" error if we try to delete but the object doesn't even exist
          delete response_container[response_container_indexer][keyword][r];
        }
      }
    } else {
      delete response_container[response_container_indexer][keyword];
    }
  } else {
    if (rs.length) {
      for (const r of rs) {
        response_container[response_container_indexer][keyword] ??= {};
        response_container[response_container_indexer][keyword][r] = number;
      }
    } else {
      send_long(message.channel, "What do you want me to set it to?");
      return; //early return for great justice
    }
  }
  fs.writeFile(saving_file_name, JSON.stringify(response_container), console_log_if_not_null);
  send_long( message.channel, "OK, "+JSON.stringify(keyword)+" is now set to "+pretty_string(response_container[response_container_indexer][keyword]) );
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
      cumulative_weights.push( (+r[key]||0) + (cumulative_weights.at(-1)||0) );
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
  const command_arguments_text = message.content.split(remindme_regex)[1]; //this just filters out the "remindme " portion. The text does not need to be further split, because the date parser is fine taking extra text.
  let d = chrono.parseDate(command_arguments_text);
  const d_first = d;
  if(!d){ //try again, once, with "in "
    d = chrono.parseDate("in "+command_arguments_text);
  }
  if(!d){
    message.reply("You have used the remindme command with argument `"+command_arguments_text+"`, but I can't understand the date you've tried to specify. I think it's `"+ d_first + "`. I also tried the modified argument `"+"in "+command_arguments_text+"` for good measure, but that also got me `"+ d + "`. My date parsing handles a lot of formats and some natural language, but it's not perfect. Try a different tack?");
  } else if (d<=new Date()){ //Because the computer operates with variable speed(?) d<now is SOMETIMES true if you've declared d to be now. But d<=now is ALWAYS true, so we use it for greater consistency.
    message.reply("You have used the remindme command with argument `"+command_arguments_text+"`, but I think you're trying to specify the date `"+ d +"`, which is "+discord_timestamp(d)+" ie "+discord_timestamp(d, true)+". I think this is in the past, and I cannot retroactively remind you of things! Please try a different time specification if need be.");
  } else {
    message.reply("OK! You have used the remindme command with argument `"+command_arguments_text+"`.\n\nOn the date `"+ d +"`, which is "+discord_timestamp(d)+" ie "+discord_timestamp(d, true)+", I will reply to your comment and quote back your message to you—assuming this bot and this channel are still around by then!");
    //Add a remindme, making sure to commit it to the authoritative data structure, and cache that structure to file:
    const remindme = {datestamp: +d, message: message};
    remindmes.push(remindme);
    fs.writeFile("remindmes.json", JSON.stringify(remindmes), console_log_if_not_null); //update record on disk
    launch_remindmes([remindme]);
  }
}

function howlongago(message){
  const command_arguments_text = message.content.split(howlongago_regex)[1]; //this just filters out the "how long ago was " portion. The text does not need to be further split, because the date parser is fine taking extra text.
  const d = chrono.parseDate(command_arguments_text)
  const now_d = new Date();
  if(!d){
    message.reply("You have used the howlongago command with argument `"+command_arguments_text+"`, but I can't understand the date you've tried to specify. I think it's `"+ d + "`. My date parsing handles a lot of formats and some natural language, but it's not perfect. Try a different tack?");
  } else { //Because the computer operates with variable speed(?) d<now is SOMETIMES true if you've declared d to be now. But d<=now is ALWAYS true, so we use it for greater consistency.
    const then = d.getTime();
    const now = now_d.getTime();
    // @ts-ignore //Idk what the big deal is; this api is supposed to be in typescript by now.
    const diff = new Intl.DurationFormat("en", { style: "long" }).format({milliseconds: now - then});
    message.reply(`${now_d} **(now)** - ${d} **(then)** = ${diff}.`);
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
  client.channels.fetch(remindme.message.channelId).then( channel => {
    if (channel === null || channel.type !== ChannelType.GuildText) {
      console.log("channel I wanted to tell about a remindme was null or not a GuildText, which is surprising, and I can't send the message.");
      console.log(remindme)
      return;
    }
    channel.send( { content: "It is time:\n"+remindme.message.content, reply: {messageReference: remindme.message.id} } );
  });
  remindmes = remindmes.filter(item => item !== remindme) //remove the remindme from the global list
  fs.writeFile("remindmes.json", JSON.stringify(remindmes), console_log_if_not_null); //update record on disk
}

function array_but_without(array, undesirable_item) { return array.filter(item => item !== undesirable_item); } // This function is just because javascript lacks a .remove() function on arrays. It is NOT in-place, you have to assign it to the original array if you want that. I thought about extending the array prototype to add a .remove(), but this sets up a footgun for for-in loops (which I never use, for that reason, but may slip up about some day).

function console_log_if_not_null(object){
  // fs.writeFile wants us to have a callback for handling errors, and there's no point writing to the console.log if the error is null (no error) 
  if (object !== null){
    console.log(object)
  }
}

//the top of this function is example code from https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
client.on(Events.MessageReactionAdd, async (reaction, user) => {
	// When a reaction is received, check if the structure is partial
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
  // Now the message has been cached and is fully available
  // The reaction is now also fully available and the properties will be reflected accurately
  if(reaction.message.guild === null){return;}
  if (reaction.message.guild.id in starboards) { //if we have turned on starboard in this server
      if (reaction.count == 7 || reaction.emoji.id == kl_test_emoji_id) { //if it has n emoji (probably: n-1 going to n. Obvious failure mode: if it goes down from n back to n-1 then back up. (n+1 to n does not actually trigger this event, which is ReactionAdd, after all.) But I'd have to, like, build and manage a hashmap to prevent that. OK fine...
        for (const channel_id of starboards[reaction.message.guild.id]){ //forward to starboard channels, with the emoji
          client.channels.fetch(channel_id).then( channel => {
            if (channel != null && channel.type === ChannelType.GuildText) {
              //Forward the message to the channel.
              //This will error silently out on contents larger than 2000 characters, but we only add a couple (dozens?) of characters anyway so it's fine in most cases. Hard to say how to best fix this limitation — maybe we just let this one slide. TODO: that can't be the right approach. Surely I should send_long...
              channel.send({
                content: `${reaction.emoji} ${reaction.message.author} ${reaction.message.url}${reaction.message.content? "\n>>> ": ""}${reaction.message.content}`,
                embeds: reaction.message.embeds,
                files: Array.from(reaction.message.attachments.values())
              });
            }
          });
        }
      }
  }
});

