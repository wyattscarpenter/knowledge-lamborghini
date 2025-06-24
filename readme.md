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
  * Furthermore, I've been able to secure almost constant uptime for the bot lately.
* NO particular security guarantees. While there's no particular reason to think data stored in the bot is **in**secure, it is just stored in plaintext on a server somewhere. So I wouldn't recommend putting critical secrets in there.
  * I *will* comply with any government demands about this data I am legally compelled to. I *may or may not* inform anyone about instances of this. I *may or may not* proactively coöperate with the authorities in the absence of a mandate to, depending on how I'm feeling about your data and you as a person, on the day when I consider it.
* NO automatic testing paradigm, because I didn't think about how easy it would be to do that until I had built all the features.

### Positive features

A note about the commands: all commands are usually just as they are written here. Most commands have to be in their own message, and can't be put into the middle, beginning, or end, of another message. Parameters to commands (word or phrase used as data by the command) are noted below with descriptive phrases in square brackets, [like so]; replace the entire bracketed word/phrase, including the brackets, with the desired parameter, when invoking the command. Optional parameters are in parentheses. The order of parameters is significant, as that's what allows kl is figure out which parameter is intended to mean what.

* @ the bot with a message containing "help" to get a link to this help document.
* @ the bot with a message containing "version" to get the current version (this is also includes, for utility's sake, the current git hash and commit message).
* Type `think!` and kl begins to recite the book located in text.json, one unit per hour in the channel in which you made the command. `stop!` ceases the madness.
* Type a phrase that's something like `who's that pokemon?` and kl posts an image from wikimedia for you to guess the file name of. The first successful guess for any picture is acknowledged.
* Using the power of NiceDice (https://github.com/wyattscarpenter/nicedice), kl interprets any message consisting solely of a dnd-style dice expression, generates random numbers to simulate dice rolls, and outputs the result.
* Type `set-for-channel (number) [keyword] [response message]` and kl will respond with the response message when the keyword is posted in the channel, as the only text in a message (case-insensitive). This is a per-channel setting! Some have found it exceptionally useful to make the response the bare url of an image that discord will then preview/embed/display directly, such as a link to an image that was previously uploaded to Discord. If you call `set-for-channel` multiple times with the same keyword, a single response is randomly selected from the pool of response messages which have thus been entered. Metaphorically, you can think of the response as a raffle (or drawing balls out of an urn), in which each response has a ticket. This quantity of "tickets" per a response can be adjusted by supplying the optional number parameter (a number like 12 or 3.01) before the keyword. (If you'd like the keyword to be a number, you must also provide the "optional" number parameter, to avoid ambiguity; supply 1 there for the default behavior.) A certain response can be disabled by using the number parameter with a value of 0. If you want to get rid of a response entirely, not just decrease its likelihood to 0, you can use `unset-for-channel [keyword] [response message]`; if you'd like to get rid of the whole family of responses to a certain keyword, you can use `unset-for-channel [keyword]`. The number parameter is not allowed for the `unset` commands. Attachments are also considered independent responses, equivalent to the link to the discord media that you attached (note that if you upload the same image to discord multiple times, discord gives different links for each image, and so the bot will consider these unequal strings of text; therefore it's easy to get duplicates (even inadvertently) — to avoid this, try copying the link for an image from `enumerate responses` if you need to refer to that image). So, if you want the bot to respond with one of three different images, you can send a message `set-for-channel foo` with the three images attached.
* `set-for-server` and `unset-for-server` are the server-wide equivalents of the above commands. The banks of server responses and channel responses are different, so if you make overlapping responses kl might double-reply, etc.
* `set` and `unset` are aliases for `set-for-server` and `unset-for-server`, respectively. Why default to server and not channel? This is because it is funnier in practice to make the default the most intrusive option.
* `enumerate responses` lists all the responses for the channel.
* `remindme`, followed by freeform text that includes a date or time of some sort that kl can interpret (I use the chrono-node library to try to parse these), will cause kl to reply to your message at that date. This feature is useful to remind you of things... if you're confident this tech stack will last that long!
  * `'(!)remind( )me(!)`, where by parenthesized characters I mean they may be optionally included or excluded in all possible combinations, are also aliased to remindme. Furthermore, since the natural language parser rejects commands like "remindme 1 day" but accepts commands like "remindme in 1 day", remindme will insert an "in " automatically at the beginning and retry parsing, if the date parsing fails the first time.
* `howlongago` is a similar command to `remindme`. Currently, it is not useful.
* `death has many doors` (starting a message; followed by any or no other text) will cause kl to post a message in that channel whenever someone leaves/is kicked from the server, identifying them by mention, tag, and user id. `death has no doors` will turn this feature off for a channel it is posted in.
* `keep a starboard here` (starting a message; followed by any or no other text) will cause kl to repost messages into that channel whenever it is running and a message gets five (5) reactions of the same type (that is to say, so to speak, 5 of the same "emoji" at once). Note: unlike other starboards, not just the star emoji, but any reaction, will cause this to happen. `don't keep a starboard here` will turn this feature off for a channel it is posted in. Please note that this feature is very bare-bones and not 100% ideally-implemented because I got sick of working on it. But it does work, in its basic functionality.
* Type `crash` and kl will crash. Please do not do this.
* Reddit link “oldification”: links to reddit.com pages are immediately reposted as links to old.reddit.com pages.
* KL displays the time in Los Angeles as its status, updated each minute.
* (!)yud(!) will display yud status (textual).
* (!)( )to( )bra(s)(z)il( )[x] prints the following text (it looks better in Discord):
```
🇧🇷


      [x]



                🏌️‍♂️
```

### Metadata

* The code is public domain under CC0 1.0.
* KL's icon is https://i.redd.it/1v4zaf534i851.jpg (also seen above, and as kl_inspirational_image.jpg in the source code) or best equivalent. I did not make this image, and lay no claim to its ownership.
* KL's motto is derivative of YouTube Poops of “Here in My Garage” by Tai Lopez.
* Invite this bot using https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot

### Deploying

I don't have a lot of advice for you if you're trying to deploy this script. For one thing, you will need a bot token from discord, which you will then put in token.json as a quoted string (ie: the json file contains only one value: a string; no object (that means, no curly braces!))

If you'd like to deploy the bot in a conventional way, on a linux/unix machine with npm and git already installed, example_bot_setup_and_run_script_one_could_use.sh could fit your needs (um, that script clones this git repo for you, so keep that in mind and don't... create a git repo in another git repo by mistake). As for myself, I want the bot to receive constant updates whenever I push to the git master, so I prefer to use constantly-try-to-update, a great script (also requires unix shell, npm, git, node).
