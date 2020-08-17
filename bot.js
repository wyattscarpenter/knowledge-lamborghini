const Discord = require('discord.js');
const https = require('http');
const client = new Discord.Client();

var text = require('./text.json');
var channel;
var interval;
var responses = {"hewwo": "perish"};

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity("Nicomachean Ethics\nhttps://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot");
});

client.on('message', message => {
  channel = message.channel;
  if (message.content.toLowerCase() === 'think!') {
    think();
  }
  if (message.content.toLowerCase() === 'stop!') {
    stop();
  }

  //dice features.
  /* tentative dice grammar:
  //note that we observe pemdas, and do NOT care about whitespace
  expression -> arithmetic | roll | subexpression
  roll -> subexpression die-symbol subexpression
  arithmetic -> arithmetic * arithmetic |  arithmetic / arithmetic | subexpression | addition
  addition -> addition + addition |  addition - addition | subexpression | number
  subexpression -> ( expression ) | number | advantage roll | disadvantage roll | min roll | max roll
  die-symbol -> ! | d
  number -> anything the implementation language will take as a number I guess
  */
  if(message.content.toLowerCase().includes('nice dice')){
    message.channel.send("Sponsored by NiceDice™");
  }
  if((result = roll(message.content.toLowerCase())).valid){
      message.channel.send(result.result);
  }

  //extremely dumb features
  if (/.*wh.*po.?k.?t?\s?mon.*/.test(message.content.toLowerCase())) { //who's that pokemon
    https.request('http://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6',//image
     (resp) => {
       let data = '';
       resp.on('data', (chunk) => {data += chunk;});
       resp.on('end', () => {channel.send(JSON.parse(data));});
     }
    ).on("error", (err) => {console.log(err);});
  }
  if (message.content.toLowerCase().startsWith("eval")) {
    //NEVER use this in production
    channel.send(eval(message.content));
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
  //text.length === 0 ?
  if(s){
    for(var l of s.split("\n")){ //break lines into seperate messages
      while(l){ //.send() Just Fails for messages over discord's 2000 character limit
        channel.send(l.slice(0,2000)); //note that this is 0-indexed and excludes the specified end character
        l = l.slice(2000); //going over is fine, you know how it is
      }
    }
    if(!interval){interval = setInterval(think, 1000*60*60);} //do it again in an hour
  } else {
    channel.send("Demand me nothing. What you know, you know.");
    stop();
  }
}

function stop(){
  clearInterval(interval);
  interval = 0;
}

function roll(string){
  var valid = true;
  var result = "";
  var total = 0;
  
  var symbolindex = 0;
  function pop(){
    return string[symbolindex++];
  }
  function peek(){
    return string[symbolindex];
  }
  
  function expression(){ //this will have to be expanded later
    var lhs = number() || 1; //allow this to be empty so the user can say eg "d6"
    var d   = die_symbol();
    var rhs = number();
    for(var i = 0; i < lhs; i++){
      var a_roll = Math.floor(Math.random()*rhs)+1;
      result += a_roll + " ";
      total += a_roll;
    }
    result += ": " + total;
  }
  function die_symbol(){
    var die_symbols = ['!','d'];
    if(die_symbols.includes(peek())){
      return pop();
    } else {
      valid = false;
    }
  }
  function number(){
    var digits = "";
    while(peek()&&peek().match(/\d/)){
      digits += pop();
    }
    return digits; //this will implicitly convert from string to number later
  }
  /* //might need to keep this test code to avoid annoying everyone with live debugging
  var match = string.match(/([0-9]+)[d!]([0-9]+)/);
  if(match){
    
  } else {
    valid = false;
  }
  */
  /*
  if(!subresult.valid){
    valid=false;
    result += "[parse error]";
  } else {
    result += subresult.result;
  }
  */
  expression();
  return {result: result, valid: valid}; 
}

// THIS MUST BE THIS WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
