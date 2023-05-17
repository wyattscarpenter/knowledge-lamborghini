<img src="https://i.redd.it/1v4zaf534i851.jpg" alt="drawing" width="400" align="right"/>

# Knowledge Lamborghini

_“But you know what I like a lot more than knowledge? Knowledge.”_

## Important links

**Instructions** (you are here): https://github.com/wyattscarpenter/knowledge-lamborghini/

**Invite** kl to your server (I think they've done several permission scheme reworks since I got this link, so who knows how that works ¯\\\_(ツ)\_/¯): https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot

**Developer** portal for editing details about the bot and finding the token (only works if you are me): https://discord.com/developers/applications/678989133196165152/

## Information

This is Knowledge Lamborghini (“kl”), an eclectic discord bot with exactly these features:

### Negative features

* NO special sigil, all commands are invoked as they are written here. All commands are case-insensitive.
* NO versioning, uptime, or stability guarantees. I keep the version number at 0.1.0 and commit broken features directly to master as I work on them. I may or may not have the bot running at any given time.
* NO particular security guarantees. While there's no particular reason to think data stored in the bot is INsecure, it is just stored in plaintext on a server somewhere. So I wouldn't recommend putting critical secrets in there.
* NO automatic testing paradigm, because I didn't think about how easy it would be to do that until I had built all the features.

### Positive features

A note about the commands: all commands are usually just as they are written here. Most commands have to be in their own message, and can't be put into the middle, beginning, or end, of another message. Parameters to commands (word or phrase used as data by the command) are noted below with descriptive phrases in square brackets, [like so]; replace the entire bracketed word/phrase, including the brackets, with the desired parameter, when invoking the command. Optional parameters are in parentheses. The order of parameters is significant, as that's what allows kl is figure out which parameter is intended to mean what.

* @ the bot with a message containing "help" to get a link to this help document.
* Type `think!` and kl begins to recite the book located in text.json, one unit per hour in the channel in which you made the command. `stop!` ceases the madness.
* Type a phrase that's something like `who's that pokemon?` and kl posts an image from wikimedia for you to guess the file name of. The first successful guess for any picture is acknowledged.
* Using the power of NiceDice (https://github.com/wyattscarpenter/nicedice), kl interprets any message consisting solely of a dnd-style dice expression, generates random numbers to simulate dice rolls, and outputs the result.
* Type `set [word] [response message]` and kl will respond with the response message when the word is posted in the channel, by itself in a message (case-insensitive). This is a per-channel setting! You can remove a setting by setting it to the empty string. Some have found it exceptionally useful to make the response the bare url of an image that discord will then preview/embed/display directly, such as a link to an image that was previously uploaded to Discord.
* `set-probabilistic (number) [word] [response message]` is the same as `set`, but sets a response in a pool of responses to be randomly selected, weighted by the number given (metaphorically, you can think of the response as a raffle, in which the response has [number] tickets)—if no number is given, that quantity defaults to 1 (if you'd like set [word] to be a number, you must provide [number], to avoid ambiguity). Naturally, to give any randomness to the effect, this command must be used multiple times. Also, using set-probabilistic on a word that already has a response set by `set` will turn that response into a one-ticket possibility.
* `set-for-server` and `set-probabilistic-for-server` are the server-wide equivalents of the above commands. The banks of server responses and channel responses are different, so if you make overlapping responses kl might double-reply, etc.
* `enumerate responses` lists all the responses for the channel.
* `remindme`, followed by freeform text that includes a date or time of some sort that kl can interpret (I use the chrono-node library to try to parse these), will cause kl to reply to your message at that date. This feature is useful to remind you of things... if you're confident this tech stack will last that long!
* Type `crash` and kl will crash. Please do not do this.
* Reddit link “oldification”: links to reddit.com pages are immediately reposted as links to old.reddit.com pages.
* KL displays the time in Los Angeles as its status, updated each minute.

### Metadata

* The code is public domain under CC0 1.0.
* KL's icon is https://i.redd.it/1v4zaf534i851.jpg (also seen above) or best equivalent.
* KL's motto is derivative of YouTube Poops of “Here in My Garage” by Tai Lopez.
* Invite this bot using https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot
