# Knowledge Lamborghini

_"But you know what I like a lot more than knowledge? Knowledge."_

This is Knowledge Lamborghini ("kl"), an eclectic discord bot with exactly these features:

Negative features:

* NO special sigil, all commands are invoked as they are written here. All commands are case-insensitive.
* NO versioning, uptime, or stability guarantees. I keep the version number at 0.1.0 and commit broken features directly to master as I work on them. I may or may not have the bot running at any given time.
* NO persistent storage over about a day, because my current hosting solution erases all of it every 24 hours. This means `set` and `set-probabilistic` are useless long-term.

Commands:
* @ the bot to get a link to this help document.
* Type "think!" and kl begins to recite the book located in text.json, one unit per hour in the channel in which you made the command. "stop!" ceases the madness.
* Type a phrase that's something like "who's that pokemon?" and kl posts an image from wikimedia for you to guess the file name of. The first successful guess for any picture is acknowledged.
* Using the power of NiceDice (https://github.com/wyattscarpenter/nicedice), kl interprets any message consisting solely of a dnd-style dice expression, generates random numbers to simulate dice rolls, and outputs the result.
* Type `set [word] [response message]` and kl will respond with the response message when the word is posted in the channel. This is a per-channel setting!
* `set-probabilistic [number] [word] [response message]` is the same as `set`, but sets a response in a pool of responses to be randomly selected, weighted by the number given (metaphorically, you can think of the response as a raffle, in which the response has [number] tickets'). Naturally, to give any randomness to the effect, this command must be used multiple times.
* Type "crash" and kl will crash. Please do not do this.
* Reddit link "oldification": links to reddit.com pages are immediately reposted as links to old.reddit.com pages.
* KL displays the time in Los Angeles as its status, updated each minute.

Metadata:

* The code is public domain under CC0 1.0.
* KL's icon is https://i.redd.it/1v4zaf534i851.jpg or best equivalent.
* KL's motto is derivative of YouTube Poops of "Here in My Garage" by Tai Lopez.
* Invite this bot using https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot

A special note for contributors:

Since responses.json is tracked in this git repo to make the bot initially work, but will have all the responses written to it (naturally), you should probably run `git update-index --skip-worktree responses.json` if you're intending to commit changes to git in the same copy of this repo you're running the bot from. I realize that this is bad UX so I will alter the code soon so you don't have to do this. (Thus making my code markedly less streamlined in that area, alas.)
