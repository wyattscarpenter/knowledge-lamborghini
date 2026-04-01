// Tests for normalize_discord_attachment_urls
const assert = require('assert');
const { normalize_discord_attachment_urls, set_response, split_once, version_string } = require('./bot.js');
const { exit } = require('process');

const eq = assert.deepStrictEqual; //We have to use this due to the funny fact that, eg, []==[] is false in js

function test_normalize_discord_attachment_urls() {
  // 1. Basic timing params strip
  assert.strictEqual(
    normalize_discord_attachment_urls('https://cdn.discordapp.com/attachments/123/456/file.png?ex=abc&is=def&hm=ghi'),
    'https://cdn.discordapp.com/attachments/123/456/file.png'
  );

  // 2. Keeps width/height params
  assert.strictEqual(
    normalize_discord_attachment_urls('https://cdn.discordapp.com/attachments/123/456/file.png?width=400&height=300&ex=abc&is=def'),
    'https://cdn.discordapp.com/attachments/123/456/file.png?width=400&height=300'
  );

  // 3. Leaves non-discord URLs untouched
  assert.strictEqual(
    normalize_discord_attachment_urls('https://example.com/attachments/123/456/file.png?ex=abc'),
    'https://example.com/attachments/123/456/file.png?ex=abc'
  );

  // 4. Works for media.discordapp.net
  assert.strictEqual(
    normalize_discord_attachment_urls('https://media.discordapp.net/attachments/123/456/file.png?ex=abc&is=def'),
    'https://media.discordapp.net/attachments/123/456/file.png'
  );

  // 5. Handles http and forces https
  assert.strictEqual(
    normalize_discord_attachment_urls('http://cdn.discordapp.com/attachments/123/456/file.png?ex=abc'),
    'https://cdn.discordapp.com/attachments/123/456/file.png'
  );

  // 6. Handles multiple URLs in a string
  assert.strictEqual(
    normalize_discord_attachment_urls('foo https://cdn.discordapp.com/attachments/1/2/a.png?ex=1 bar https://media.discordapp.net/attachments/3/4/b.jpg?is=2&width=100'),
    'foo https://cdn.discordapp.com/attachments/1/2/a.png bar https://media.discordapp.net/attachments/3/4/b.jpg?width=100'
  );

  // 7. Leaves trailing ? or & off
  assert.strictEqual(
    normalize_discord_attachment_urls('https://cdn.discordapp.com/attachments/1/2/a.png?'),
    'https://cdn.discordapp.com/attachments/1/2/a.png'
  );
  assert.strictEqual(
    normalize_discord_attachment_urls('https://cdn.discordapp.com/attachments/1/2/a.png?ex=abc&'),
    'https://cdn.discordapp.com/attachments/1/2/a.png'
  );

  // 8. Leaves non-attachment discord URLs untouched
  assert.strictEqual(
    normalize_discord_attachment_urls('https://cdn.discordapp.com/emojis/123.png?ex=abc'),
    'https://cdn.discordapp.com/emojis/123.png?ex=abc'
  );

  // 9. Handles garbage input gracefully
  assert.strictEqual(
    normalize_discord_attachment_urls('not a url at all'),
    'not a url at all'
  );

  // 10. Handles URLs with no params
  assert.strictEqual(
    normalize_discord_attachment_urls('https://cdn.discordapp.com/attachments/1/2/a.png'),
    'https://cdn.discordapp.com/attachments/1/2/a.png'
  );
}

function test_split_once() {
  eq(
    split_once("a  b", " "),
    ["a", " b"]
  );
   eq(
    split_once("a  b", "q"),
    ["a  b", ""]
  );
  eq(
    split_once("", "q"),
    ["", ""]
  );
  eq(
    split_once("a  b", /\s/),
    ["a", " b"]
  );
  eq(
    split_once("a\n\nb", /\s/),
    ["a", "\nb"]
  );
}
let reply_mock = undefined;
function fake_channel_send(x){
  reply_mock = x.content;
  return {catch: () => {}};
}

/** Non-comprehensive tests for set_responses. Note that these do write to disk. */
function test_set_responses() {
  const test_msg = {
    content: "set test_boy hm\nm", //It seems inconvenient to test this actual value, alas.
    guild: {id: "test_guild_id"},
    channel: {id: "test_channel_id", send: fake_channel_send},
    attachments: {values: ()=> []}
  };
  set_response(test_msg);
  eq(reply_mock, 'OK, "test_boy" is now (channel) set to 1 response with a cumulative pool of 1 total ticket.');
  test_msg.content = "set ";
  set_response(test_msg);
  eq(reply_mock, 'What do you want me to (channel) set it to?');
  test_msg.content = "set test_boy";
  set_response(test_msg);
  eq(reply_mock, 'What do you want me to (channel) set it to?');
  test_msg.content = "set 2 test_boy";
  set_response(test_msg);
  eq(reply_mock, 'What do you want me to (channel) set it to?');
  test_msg.content = "unset test_boy";
  set_response(test_msg, false, true);
  eq(reply_mock, 'OK, "test_boy" is now (channel) set to 0 responses with a cumulative pool of 0 total tickets.');
}

function _test_url_detector() {
  //Discord has a particular, non-url-standard idea of what things to consider links and highlight. For instance, "https://example.com/hello." is detected as a link to "https://example.com/hello" and the period is not highlighted, even though that would be a valid url technically. Many such cases. This being a discord project, we try to agree with discord. However, we don't have functionality that satisfies this. These tests are just here to establish some cases that an ideal implementation would handle correctly. This unknown function is called x here. Amusingly, none of our static analysis complains about it.
  //Side note: this breaks at least one of my IDE paren colorers lmao
  eq(x("https://example.com/hello."), "https://example.com/hello");
  eq(x("(https://en.wikipedia.org/wiki/God_(disambiguation)"), "https://en.wikipedia.org/wiki/God_(disambiguation)");
  eq(x("((https://en.wikipedia.org/wiki/God_((disambiguation)))"), "https://en.wikipedia.org/wiki/God_((disambiguation))");
  eq(x("(https://en.wikipedia.org/wiki/God_(disambiguation)"), "https://en.wikipedia.org/wiki/God_(disambiguation)");
  eq(x("https://en.wikipedia.org/wiki/God_disambiguation)"), "https://en.wikipedia.org/wiki/God_disambiguation");
  eq(
    x("(((((((((https://en.wikipedia.org/wiki/God_(((((((((((((((disambiguation)))(((())))))))))))))))))))))))))))))))))))"),
    "https://en.wikipedia.org/wiki/God_(((((((((((((((disambiguation)))(((()))))))))))))))))))))))))))))))))))"
  );
}

function _bad_test_tee_hee_hee() {
    //Not sure if the tests are actually running? Just uncomment this failing test to soothe your mind.
    assert.strictEqual(0,'0');
}
//_bad_test_tee_hee_hee();
console.log(version_string);
eq(version_string[0], "V");
test_normalize_discord_attachment_urls();
test_split_once();
test_set_responses();
console.log('All tests passed!');
exit(); // Since we require the bot, we must exit the process once we are done with our tests or, like, the bot will just start running.
