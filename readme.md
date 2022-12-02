# Knowledge Lamborghini

_"But you know what I like a lot more than knowledge? Knowledge."_

## Important links

**Instructions** (you are here): https://github.com/wyattscarpenter/knowledge-lamborghini/

**Invite** kl to your server (I think they've done several permission scheme reworks since I got this link, so who knows how that works ¯\\\_(ツ)\_/¯): https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot

**Developer** portal for editing details about the bot and finding the token (only works if you are me): https://discord.com/developers/applications/678989133196165152/

## Information

This is Knowledge Lamborghini ("kl"), an eclectic discord bot with exactly these features:

### Negative features

* NO special sigil, all commands are invoked as they are written here. All commands are case-insensitive.
* NO versioning, uptime, or stability guarantees. I keep the version number at 0.1.0 and commit broken features directly to master as I work on them. I may or may not have the bot running at any given time.
* NO automatic testing paradigm, because I didn't think about how easy it would be to do that until I had built all the features.

### Commands
* @ the bot to get a link to this help document.
* Type "think!" and kl begins to recite the book located in text.json, one unit per hour in the channel in which you made the command. "stop!" ceases the madness.
* Type a phrase that's something like "who's that pokemon?" and kl posts an image from wikimedia for you to guess the file name of. The first successful guess for any picture is acknowledged.
* Using the power of NiceDice (https://github.com/wyattscarpenter/nicedice), kl interprets any message consisting solely of a dnd-style dice expression, generates random numbers to simulate dice rolls, and outputs the result.
* Type `set [word] [response message]` and kl will respond with the response message when the word is posted in the channel. This is a per-channel setting! You can remove a setting by setting it to the empty string.
* `set-probabilistic ([number]) [word] [response message]` is the same as `set`, but sets a response in a pool of responses to be randomly selected, weighted by the number given (metaphorically, you can think of the response as a raffle, in which the response has [number] tickets')—if no number is given, that quantity defaults to 1 (if you'd like set [word] to be a number, you must provide [number], to avoid ambiguity). Naturally, to give any randomness to the effect, this command must be used multiple times. Also, using set-probabilistic on a word that already has a response set by `set` will turn that response into a one-ticket possibility.
* `enumerate responses` lists all the responses for the channel.
* Type "crash" and kl will crash. Please do not do this.
* Reddit link "oldification": links to reddit.com pages are immediately reposted as links to old.reddit.com pages.
* KL displays the time in Los Angeles as its status, updated each minute.

### Metadata

* The code is public domain under CC0 1.0.
* KL's icon is https://i.redd.it/1v4zaf534i851.jpg or best equivalent.
* KL's motto is derivative of YouTube Poops of "Here in My Garage" by Tai Lopez.
* Invite this bot using https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot
