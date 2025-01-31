<img src="kl_inspirational_image.jpg" alt="“HELLO, FOOD?” “FOOD BROKE” “UNDERSTANDABLE. HAVE A GREAT DAY” “GREAT DAY BROKE TOO”" width="400" align="right"/>

# Knowledge Lamborghini

_“But you know what I like a lot more than knowledge? Knowledge.”_

## Important links

**Instructions** and source code (you are here): https://github.com/wyattscarpenter/knowledge-lamborghini/

**Invite** kl to your server (I think they've done several permission scheme reworks since I got this link, so who knows how that works ¯\\\_(ツ)\_/¯): https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot

**Developer** portal for editing details about the bot and finding the token (only works if you are me): https://discord.com/developers/applications/678989133196165152/

**NPM** package: https://www.npmjs.com/package/knowledge-lamborghini

## Information

This is Knowledge Lamborghini (“kl”), an eclectic discord bot with exactly these features:

### Negative features

* NO special sigil, all commands are invoked as they are written here. All commands are case-insensitive.
* NO uptime, or stability guarantees. I commit broken features directly to master as I work on them. I may or may not have the bot running at any given time.
  * However, this bot is also published as [a package](https://www.npmjs.com/package/knowledge-lamborghini) on npmjs.org, and only non-broken versions should make it up there.
* NO particular security guarantees. While there's no particular reason to think data stored in the bot is **in**secure, it is just stored in plaintext on a server somewhere. So I wouldn't recommend putting critical secrets in there.
* NO automatic testing paradigm, because I didn't think about how easy it would be to do that until I had built all the features.

### Positive features

A note about the commands: all commands are usually just as they are written here. Most commands have to be in their own message, and can't be put into the middle, beginning, or end, of another message. Parameters to commands (word or phrase used as data by the command) are noted below with descriptive phrases in square brackets, [like so]; replace the entire bracketed word/phrase, including the brackets, with the desired parameter, when invoking the command. Optional parameters are in parentheses. The order of parameters is significant, as that's what allows kl is figure out which parameter is intended to mean what.

* @ the bot with a message containing "help" to get a link to this help document.
* @ the bot with a message containing "version" to get the current version (this is also includes, for utility's sake, the current git hash and commit message).
* Type `think!` and kl begins to recite the book located in text.json, one unit per hour in the channel in which you made the command. `stop!` ceases the madness.
* Type a phrase that's something like `who's that pokemon?` and kl posts an image from wikimedia for you to guess the file name of. The first successful guess for any picture is acknowledged.
* Using the power of NiceDice (https://github.com/wyattscarpenter/nicedice), kl interprets any message consisting solely of a dnd-style dice expression, generates random numbers to simulate dice rolls, and outputs the result.
* Type `set-for-channel [word] [response message]` and kl will respond with the response message when the word is posted in the channel, by itself in a message (case-insensitive). This is a per-channel setting! You can remove a setting by setting it to the empty string. Some have found it exceptionally useful to make the response the bare url of an image that discord will then preview/embed/display directly, such as a link to an image that was previously uploaded to Discord.
* `set-probabilistic-for-channel (number) [word] [response message]` is the same as `set-for-channel`, but sets a response in a pool of responses to be randomly selected, weighted by the number given (metaphorically, you can think of the response as a raffle, in which the response has [number] tickets)—if no number is given, that quantity defaults to 1 (if you'd like set [word] to be a number, you must provide [number], to avoid ambiguity). Naturally, to give any randomness to the effect, this command must be used multiple times. Also, using set-probabilistic on a word that already has a response set by `set` will turn that response into a one-ticket possibility.
* `set-for-server` and `set-probabilistic-for-server` are the server-wide equivalents of the above commands. The banks of server responses and channel responses are different, so if you make overlapping responses kl might double-reply, etc.
* `set` and `set-probabilistic` are aliases for `set-for-server` and `set-probabilistic-for-server`, respectively. Why default to server and not channel? This is because it is funnier in practice to make the default the most intrusive option.
* `enumerate responses` lists all the responses for the channel.
* `remindme`, followed by freeform text that includes a date or time of some sort that kl can interpret (I use the chrono-node library to try to parse these), will cause kl to reply to your message at that date. This feature is useful to remind you of things... if you're confident this tech stack will last that long!
  * `'(!)remind( )me(!)`, where by parenthesized characters I mean they may be optionally included or excluded in all possible combinations, are also aliased to remindme. Furthermore, since the natural language parser rejects commands like "remindme 1 day" but accepts commands like "remindme in 1 day", remindme will insert an "in " automatically at the beginning and retry parsing, if the date parsing fails the first time.
* `death has many doors` (starting a message; followed by any or no other text) will cause kl to post a message in that channel whenever someone leaves/is kicked from the server, identifying them by mention, tag, and user id. `death has no doors` will turn this feature off for a channel it is posted in.
* Type `crash` and kl will crash. Please do not do this.
* Reddit link “oldification”: links to reddit.com pages are immediately reposted as links to old.reddit.com pages.
* KL displays the time in Los Angeles as its status, updated each minute.

### Metadata

* The code is public domain under CC0 1.0.
* KL's icon is https://i.redd.it/1v4zaf534i851.jpg (also seen above, and as kl_inspirational_image.jpg in the source code) or best equivalent. I did not make this image, and lay no claim to its ownership.
* KL's motto is derivative of YouTube Poops of “Here in My Garage” by Tai Lopez.
* Invite this bot using https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot
