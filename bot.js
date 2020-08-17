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
    if(text.length){
      think();
    }else{
      channel.send("Demand me nothing. What you know, you know.");
    }  
  }
  if (message.content.toLowerCase() === 'stop!') {
    stop();
  }

  //dice features.
  /* tentative dice grammar:
  //note that we observe pemdas (er... pdmdas?), and do NOT care about whitespace
  expression -> arithmetic | roll | subexpression
  roll -> subexpression die-symbol subexpression
  arithmetic -> arithmetic * arithmetic |  arithmetic / arithmetic | subexpression | addition
  addition -> addition + addition |  addition - addition | subexpression | number //this actually gives peasdm lol TODO:fix
  subexpression -> ( expression ) | number | advantage roll | disadvantage roll | min roll | max roll
  die-symbol -> ! | d
  number -> anything the implementation language will take as a number I guess
  */
  if(message.content.toLowerCase().includes('nice dice')){
    message.channel.send("Sponsored by NiceDice™");
  }
  if((result = execute_dice(message.content.toLowerCase())).valid){
      message.channel.send(result.result);
  } else { console.log(result); }

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

function execute_dice(string){ //might want to make this return the result or false, instead of an object with a valid field
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

  //we do NOT currently do pemdas, and in fact you must precisely parenthesize expressions like (2+3)+4
  //since we only allow precisely parenthesized binary expressions, it's more like Precise Dice lol
  function expression(){ //this will have to be expanded later
    var lhs = peek()=='('? subexpression() : number(); //could refactor to something like "sub_or_num"
    var op = operator();
    var rhs = peek()=='('? subexpression() : number();
    //as we dispatch to operators, keep in mind that number can still be "",
    //so the implicit default has to be specified for each operator.
    //for some reason I decided that the lhs would always convert to something
    //but rhs missing was always a parse fail.
    if(['!','d'].includes(op)){
      return roll(lhs||1, rhs||(valid=false));
    } else if (op=='+') {
      return lhs||0 + rhs||(valid=false);
    } else if (op=='-') {
      return lhs||0 - rhs||(valid=false);
    } else if (op=='*') {
      return lhs||1 * rhs||(valid=false); //very tempting to make missing lhs here result in "nullpointerexception". but I contain myself.
    } else if (op=='/') {
      return lhs||1 / rhs||(valid=false);
    } else if (op=='%') {
      return lhs||1 / rhs||(valid=false); //like multiplication, it's unclear what/if the implicit here should be, since 1 is... useless.
    }
  }
  function subexpression(){
    if(peek()=='('){
      pop();
    }else{
      valid=false;
    }
    var value = expression();
    if(peek()==')'){
      pop();
    }else{
      valid=false;
    }
    return value;
  }
  function roll(rolls, sides){
    for(var i = 0; i < rolls; i++){
      var a_roll = Math.floor(Math.random()*sides)+1;
      result += a_roll + " ";
      total += a_roll;
    }
    result += ": " + total;
  }
  function operator(){
    if(['d','!','*','/','%'].includes(peek())){
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
