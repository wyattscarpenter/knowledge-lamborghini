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

* NO special sigil, all commands are invoked as they are written here.
  * However, you are allowed to use a prefix `!` or `! ` on any command, which will be stripped out and ignored by the bot, since I know some people are in that habit. This command prefix can also be set with the first argument to kl on the command line; this is largely for testing purposes.
  * All commands are case-insensitive.
* NO uptime, or stability guarantees. I commit broken features directly to master as I work on them. I may or may not have the bot running at any given time.
  * However, this bot is also published as [a package](https://www.npmjs.com/package/knowledge-lamborghini) on npmjs.org, and only non-broken versions should make it up there.
  * Furthermore, I've been able to secure almost constant uptime for the bot lately.
* NO particular security guarantees. While there's no particular reason to think data stored in the bot is **in**secure, it is just stored in plaintext on a server somewhere. So I wouldn't recommend putting critical secrets in there.
  * I (the developer) generally do not look at, nor arbitrarily manipulate, this data, but I reserve the absolute right to.
  * I *will* comply with any government demands about this data I am legally compelled to. I *may or may not* inform anyone about instances of this. I *may or may not* proactively coöperate with the authorities in the absence of a mandate to, depending on how I'm feeling about your data and you as a person, on the day when I consider it.
* MINIMAL automatic feature testing, because I didn't think about how easy it would be to do that until I had built all the features. (And discord is hard to meaningfully mock, for some features.)
* For everything except remindmes and starboards (features where this would be extremely annoying), this bot has a sort of loosey-goosey attitude towards correctness, and usually doesn't do anything in particular to catch errors; so, if there are transitory networking issues between the bot and discord, a couple of messages might get dropped here and there. (This is on top of the normal downtime the bot occasionally experiences, during which it also cannot receive any messages, naturally.) Feel free to bring these incidents up as issues on GitHub or batphone if they annoy you, and/or fix my code.

### Positive features

A note about the commands: all commands are usually just as they are written here. Most commands have to be in their own message, and can't be put into the middle, beginning, or end, of another message. Parameters to commands (word or phrase used as data by the command) are noted below with descriptive phrases in square brackets, [like so]; replace the entire bracketed word/phrase, including the brackets, with the desired parameter, when invoking the command. Optional parameters are in parentheses. The order of parameters is significant, as that's what allows kl is figure out which parameter is intended to mean what.

* @ the bot with a message containing "help" to get a link to this help document.
* @ the bot with a message containing "version" to get the current version.
  * this is also includes, for utility's sake, the current git hash. It would include the current git message, but that was harder to get.
* Type a message beginning with `echo` and kl will respond with the message (stripping the `echo`) immediately, once. This can be useful for doing jokes in the bot's voice. For instance, you can command it to echo and then delete your command message. Please note that this means anyone can easily spoof messages "from the bot" and you shouldn't rely on that for bot announcements, things not being a scam, etc.
* You may leave a message for the developer using `batphone`; whatever follows `batphone` will be stored into an array, which I will check (and remove items from) **extremely infrequently**. In fact, everyone can check what's in the batphone, using the command `enumerate batphone`. This is generally for bug reports. Please do not spam the batphone. Furthermore, it is far better to raise an issue on github than in the batphone, if you can be bothered.
* Type `think!` and kl begins to recite the book located in text.json, one unit per hour in the channel in which you made the command. `stop!` ceases the madness.
* Type a phrase that's something like `who's that pokemon?` and kl posts an image from wikimedia for you to guess the file name of. The first successful guess for any picture is acknowledged.
* Using the power of [NiceDice](https://github.com/wyattscarpenter/nicedice), kl interprets any message consisting solely of a dnd-style dice expression, generates random numbers to simulate dice rolls, and outputs the result.
* Type `set (number) [keyword] [response message]` and kl will respond with the response message when the keyword is posted in the server, as the only text in a message (case-insensitive).
  * The keyword is subject to the same optional prefix striping that commands are. For example, by default `set !foo bar` and `set foo bar` do the same thing. Note that the optional space in the regular optional command prefix is not allowed here (there is no way to include a space in a keyword, since it is terminated by a space). Once you set `set foo bar` or `set !foo bar` you can trigger either of those equally well with both of `foo` or `!foo`; this is the nature of the optional command prefix of this bot.
    * Of course, if you want to have a keyword that "actually" starts with !, internally, you'll have to use !!, if you feel me. For both setting and triggering. But don't worry about that; it's just an edge-case.
  * The keyword is not allowed to have spaces in it, since it is terminated by a space. However, if you use `\s` instead of spaces and `set-regex` (described in more detail later in this readme) instead of `set`, you can get a very similar result, allowing you to have a keyword with spaces.
  * Some have found it exceptionally useful to make the response the bare url of an image that discord will then preview/embed/display directly, such as a link to an image that was previously uploaded to Discord.
  * If you call `set` multiple times with the same keyword (but different response messages), then a pool of response messages which have thus been entered is populated, and the keyword triggers a single response randomly selected from this pool.
  * Metaphorically, you can think of the response selection event as a raffle (or drawing balls out of an urn) in which each response in the keyword's pool has some number of tickets. This quantity of "tickets" per a response can be directly adjusted by supplying the optional number parameter (a number like 12 or 3.01) before the keyword.
  * If you'd like the keyword to be a number, you must also provide the "optional" number parameter, to avoid ambiguity; supply 1 there for the default behavior.
  * A certain response can be disabled by using the number parameter with a value of 0.
  * If you want to get rid of a response entirely, not just decrease its likelihood to 0, you can use `unset [keyword] [response message]`; if you'd like to get rid of the whole family of responses to a certain keyword, you can use `unset [keyword]`. The number parameter is not allowed for the `unset` commands.
  * Attachments are also considered independent responses, equivalent to the link to the discord media that you attached (note that if you upload the same image to discord multiple times, discord gives different links for each image, and so the bot will consider these unequal strings of text; therefore it's easy to get duplicates (even inadvertently) — to avoid this, try copying the link for an image from `enumerate responses` if you need to refer to that image). So, if you want the bot to respond with one of three different images, you can send a message `set foo` with the three images attached.
  * To avoid an infelicity in the way discord handles links, response messages are subject to something I call "discord attachment url normalization"; links of the form `https://cdn.discordapp.com/attachments/522287497697766714/689602347856091837/image_named_whatever.png?ex=04813579&is=1e3b4f9a&hm=2c3e455146676c93d186698f82b14c744e3df25d24286dd620301cb6f00479ab&` will have the discord timing parameters stripped off when they appear in response messages (including attachments), eg they will end up looking like: `https://cdn.discordapp.com/attachments/522287497697766714/689602347856091837/image_named_whatever.png`. This is to prevent the unfortunate scenario where you try to `unset` a link but discord is automatically refreshing the timing parameters so the link stored inside the bot is not the same as the link you get from discord. (That state of affairs will still occur, but the bot will now ignore the difference.) Other types of parameters like width and height are not stripped (although, they don't seem to me to do anything, in my brief experimentation). If a url like this has no parameters, it will not have a ? (the ?, and any extra ampersands, will be stripped if provided). http will be converted to https. Normalization is applied on input, comparison, and output of response messages (although we always output to discord, which always re-applies the parameters, so it's not like you'll notice that the bot outputs without those parameters...). The same thing also applies to links with the domain name media.discordapp.net, although the resulting link will keep its media.discordapp.net domain name.
  * Sadly, audio links, when auto-embedding, are not properly previewed in a playable way. So, if you set a music file as a response, the user will have to download it to play it if they get that response. This was very difficult for me to figure out how to work around (the Discord API is quite byzantine and DiscordJS is not better), so I now just consider it a Discord Problem™, as also documented in this suggestion in their community forum: https://support.discord.com/hc/en-us/community/posts/360053093333-Ability-to-embed-audio-files-with-a-URL
* `set-for-channel` and `unset-for-channel` are the channel-specific equivalents of the above commands. The banks of server responses and channel responses are different, so if you make overlapping responses the bot might double-reply, etc.
* `set-for-server` and `unset-for-server` are equivalent to `set` and `unset`, respectively. Why default to server and not channel? This is because it is funnier in practice to make the default the most intrusive option.
* `(un)set-regex(-for-server/-for-channel)` are a family of commands exactly analogous to the set commands (including the optional numeric argument), except the keyword is interpreted as a regex. For example, `set-regex ^a+ ok` will send a response "ok" to any message that begins with one or more "a"s. This is also case-insensitive ("i" is the only regex flag set here, in fact). The regex syntax used is [javascript's](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions), and the precise function used is [string.match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match), whose result is fed into a different function so you can use `$1`, etc, to reference the contents of capture groups in the response (which response is otherwise printed verbatim upon the detection of a match). I like to use regex101 to figure out what regexes do: https://regex101.com/?flavor=javascript. I don't let you pass flags to the regexp object, but you can put [modifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Modifier) in the regex itself for certain flags, if you want. Note that the regex keyword still cannot have a space in it (you can use `\s` instead, that's very similar), nor can it be completely numeric unless you explicitly specify the optional (number) parameter before it (there are also several ways to make a regex not purely numeric without changing its behavior, like adding `(?:)` to the end (that's a non-capturing empty group)). An invalid regex will never match, and kl will warn & prevent you from setting an invalid regex.
* `enumerate responses (argument)` lists all the responses for the channel.
  * This enumerates channel, server, and regex responses — everything.
  * If an argument is provided, it will only list responses associated with that argument.
    * The argument also has its optional command prefix stripped, as in the keyword in set.
* `remind( )me( )(!)`, followed by freeform text that includes a date or time of some sort that kl can interpret (I use the [chrono-node](https://www.npmjs.com/package/chrono-node) library to try to parse these), will cause kl to reply to your message at that date. This feature is useful to remind you of things... if you're confident this tech stack will last that long!
* `howlongago` (and variants) is a similar command to `remindme`. Currently, it is not useful.
* `death has many doors` (starting a message; followed by any or no other text) will cause kl to post a message in that channel whenever someone leaves/is kicked from the server, identifying them by mention, tag, and user id. `death has no doors` will turn this feature off for a channel it is posted in.
* `keep a starboard here [quantity required in order to forward]` (starting a message; followed by any or no other text) will cause kl to repost messages into that channel whenever it is running and a message gets [quantity required in order to forward] (default 7) reactions of the same type (that is to say, so to speak, n of the same "emoji" at once). Note: unlike other starboards, not just the star emoji, but any reaction, will cause this to happen. If you'd like to adjust that quantity, you can call the command again with a different quantity. `don't keep a starboard here` will turn this feature off for a channel it is posted in; this will also wipe out kl's memory of what posts it's already forwarded (and, thus, they may be forwarded again).
* Type `crash` and kl will crash. Please do not do this.
* Reddit link “oldification”: links to reddit.com pages are immediately reposted as links to old.reddit.com pages. (See "Known Issues"§"Link detection" below for a caveat about link format.)
* KL displays the time in Los Angeles as its status, updated each minute.
* `yud(!)` will display yud status (textual).
* `Jo(h)n(a)(t)(h)(a)(n)( )Frakes(?)` (anywhere in a message) will display the wisdom of Jonathan Frakes as it applies to your situation.
* `Frakes(?)` will display the wisdom of Jonathan Frakes as it applies to your situation (but via youtube links).
* `to( )bra(s)(z)il( )[x]` prints the following text (it looks better in Discord):
```
🇧🇷


      [x]



                🏌️‍♂️
```

### Known issues

#### Reddit link oldification

There is no way to turn off the Reddit link oldification feature. I think this is fine, but it has been complained about by a user before.

#### Link detection

Link (URL) detection is kind of a fraught topic. There is an official, standard URL syntax, of course, and I (often) use a regex that probably matches this. But Discord (following in the footsteps of many other apps) uses a different grammar to detect URLs, to highlight them, in order to not include trailing punctuation as part of the URL (even though technically that could be a valid URL, it usually is just punctuation that happens to follow the URL). So, the link detected and manipulated by KL might or might not match the link detected and highlighted by Discord, exactly. For instance, urls followed by eg a comma might include the comma, since it's technically a valid url to have that character at the end. This is arguably undesireable behavior. Feel free to raise an issue about this and/or fix my code, if it bothers you and/or you figure out the best way to do it. I have some test case in the tests that you can check against. https://github.com/discord/simple-markdown and https://github.com/discord/SimpleAST seem like they would be promising ways to find the real Discord URL-detection algorithm, but they don't seem to contain it as far as I can tell. I would be willing to use a generic, off-the-shelf URL-detector, but I didn't look into this too hard.

```js
const DISCORD_URL_REGEX = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/ //I extracted this regex from the js of the discord app webpage. This is the regex discord uses to detect urls, which explains why it — actually this doesn't explain how it captures https://en.wikipedia.org/wiki/God_(disambiguation) correctly. That should be left out, according to https://regex101.com/?flavor=javascript. It seems to count matching parens, and then if you add more stuff after a non-matching paren, resume being a hyperlink.
```

#### Audio responses

See "Sadly, audio links[...]" above.

#### Typescript

##### Preamble

If you are maintaining or contributing to this project, you should read this section. Otherwise, you don't have to, and it will probably be quite boring and confusing to you. And, ideally, the user will never see any of this stuff! However, if you are maintaining, then you'll probably want to know about these things. Additionally, bot.js may contain some `//@ts-expect-error` lines documenting similar stuff. (The goal of `//@ts-expect-error` lines is generally to be removed once something underlying is fixed.)

##### Format

Due to the contingency of history, the file is a js file that just has TSDoc comments on the functions and top-level variables to provide type information. This seems fine to me; I will let it go on like this.

These type comments aim to be comprehensive to avoid problems caused by types being inferred as `any`. (`any` is bad because it is not typesafe; it lets you ignore the type system.) Luckily, typescript will warn you about most cases where `any` pops up implicitly, although sometimes an `any` sneaks in anyway, like in the return type of `require`.

Here I'll make my normal token complaint that it's not actually technologically necessary for me to provide these type annotations; the typechecker should just deduce the types, like it does in code that doesn't cross function boundaries. This is a UX failure and should be fixed. But I am not in charge of typescript.

##### Version

The typescript version is pinned to the latest 5. At time of writing (2026-04-01), 6 (current version: 6.0.2) seems to have a couple of problems, such as multiply-referenced types being mistaken for distinct types. They will probably eventually iron those out. I know about those errors because it's what VS Code uses to show me type errors in the IDE (I *think*), which makes it a little annoying that it displays spurious type errors.

The versions of node and ecmascript I target are probably just chosen to encompass all the features I was using at the time and were limited mainly by the fact that I live in linear time and cannot rely on versions from the future. It's probably fine and mostly painless to upgrade them. It may be impossible or quite inconvenient to downgrade them, but hopefully you don't need to do that.

##### Seemingly-useless single-use generics

This codebase often uses generics that apparently only occur once in the type signature, which seems mysterious and perhaps useless. This section explains the various reasons why we do that. We'll call a single-use generic `T` in this section for brevity. You might think `T` is equivalent in meaning to `unknown` (why did you think this?), but they actually have different semantics in important ways, some intentional and some bugs, that force us to use `T` instead.

`unknown` is the typesafe top type in TypeScript, meaning that it can represent any value. This is to be contrasted with `any`, which is a type that can also represent any value, but turns off typechecking when you try to assign it to things, thus ruining the whole point of having these types in the first place. Cf https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type. (Why is the reference information for the TypeScript system its release notes? This is another one of life's little mysteries.) You should almost never use `any`. Which makes it sad that it's named so temptingly for a top type. Anyway, because I'm such an `unknown`-respecter, you might think I use it for my fully generic functions, which can take any value whatsoever. But I actually never use it in this codebase.

First of all, often a function with a fully generic parameter also wants to return that value. If you use `unknown` then typescript will deduce the return type as `unknown` when you return that parameter, which makes using the result of the function cumbersome. But if you use `T`, then the return type will also be deduced (when proper) as `T`, which means the calling code can keep using the return value while knowing its type, which is very convenient. Notably, this deduction happens whether or not you annotate the return type, so I usually don't annotate the return type, and so this is one case where it looks like I'm using a generic with only one use.

But, secondly, usually my functions are not indeed fully generic. Here are some instances in which I use `T` rather than `unknown`, and why:

• When the function needs to unary plus the parameter (eg `+x`) to convert it to a number, TypeScript correctly deduces that this is disallowed on `unknown` — for example, `+Symbol()` TypeErrors at runtime. So instead I use `T`. The point of this otherwise-useless type annotation is that it does in fact let typescript catch this type error when you try to pass a Symbol or BigInt to this function (in accordance with https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tonumber), even though I'm not sure what type you're actually supposed to specify here for a unary-plus-able type, and the error messages won't tell me.

• When the function needs to concatenate/interpolate an `unknown` value with a string, TypeScript accepts this, but this is a bug — for example, `""+Symbol()` TypeErrors at runtime. See https://github.com/microsoft/TypeScript/issues/29963. Here we use a `T` called Stringable to give our code a fighting chance to be correct in the future, although current TypeScript does not seem to catch this error.

• When the function calls JSON.stringify on the value, this can result in a runtime TypeError. For instance `JSON.stringify(BigInt(123))`; see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/BigInt_not_serializable. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#exceptions also claims this will be thrown if the value contains a circular reference (although that would be harder to statically verify against). I've raised this issue on GitHub: https://github.com/microsoft/TypeScript/issues/63333. Given that they have decided not to fix the type signature of JSON.stringify in the past, for a different problem (https://github.com/microsoft/TypeScript/issues/18879#issuecomment-1399758565), and also how busy they are with the TypeScript 7.0 migration, I'm not sanguine about them fixing this one any time soon. Here we use a `T` called Stringifyable to give our code a fighting chance to be correct in the future, although current TypeScript does not seem to catch this error. TODO: maybe try installing https://github.com/uhyo/better-typescript-lib or https://www.totaltypescript.com/ts-reset?

Nb: When multiple *independent* single-use generics are needed, they need to be declared like `T1`, `T2`, etc, instead of all sharing the same `T`, or this would imply that the values that use `T` all have to be the same type, which isn't intended.

### Metadata

* The code is public domain under CC0 1.0.
* KL's icon is https://i.redd.it/1v4zaf534i851.jpg (also seen above, and as kl_inspirational_image.jpg in the source code) or best equivalent. I did not make this image, and lay no claim to its ownership.
* KL's motto is derivative of YouTube Poops of “Here in My Garage” by Tai Lopez.
* Invite this bot using https://discord.com/api/oauth2/authorize?client_id=678989133196165152&permissions=0&scope=bot

### Deploying

I don't have a lot of advice for you if you're trying to deploy this script. For one thing, you will need a bot token from discord, which you will then put in token.json as a quoted string (ie: the json file contains only one value: a string; no object (that means, no curly braces!))

If you'd like to deploy the bot in a conventional way, on a linux/unix machine with npm and git already installed, example_bot_setup_and_run_script_one_could_use.sh could fit your needs (um, that script clones this git repo for you, so keep that in mind and don't... create a git repo in another git repo by mistake). As for myself, I want the bot to receive constant updates whenever I push to the git master, so I prefer to use constantly-try-to-update, a great script (also requires unix shell, npm, git, node).

### Editorializing

This project is written in javascript, which I don't really recommend, using discordjs, which I don't recommend, because when you google "how to make discord bot" that's one of the things that comes up first. Back in the day that seemed easiest to me, and now here we are all of these years later. This project also uses typescript (run as a check on our mostly-vanilla js) to do a bit of static analysis on the code to prevent some late-arising errors, which is better than nothing, I suppose!

### Feature requests

The following was written by the developer to a user (@neophos) regarding a request for a new feature, something about an oracle ("do not let people reroll the words of the oracle"). It still stands as the developer's current attitude towards feature requests:

<blockquote style="white-space: pre-wrap !important;">
  Dear user @neophos,

  I hope this missive finds you well. How are you? I am fine. Anyway, I'm honored my bot is being used to reveal, presumably, the true words of God; presumably using the "raffle" feature of set. However, at the moment (and indefinitely) the only thing that keeps me working on (for some low sense of "working on") this bot is my violated pride because of the variety of bugs in the features I did add. If you want to add a new feature (such as a set that can't be retriggered arbitrarily), I encourage you to code it up yourself and open a pull request on the github.

  I was thinking about merging set and set-regex into one data structure, with an is_regex boolean flag in there, so you could add a set-oracle command with an is_oracle flag as well, if you get my meaning. (Here I'm tricking you into doing my refactor if you want your feature mwahaha.) While I'm on the topic, I was also musing about if the set-regex-for-channel type stuff should actually just be unix-style flags, like set --regex --channel. Undecided on that.

  Peace and love, peace and love,

  Your old pal Wyatt
</blockquote>
