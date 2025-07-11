// Tests for normalize_discord_attachment_urls
const assert = require('assert');
const { normalize_discord_attachment_urls } = require('./bot.js');
const { exit } = require('process');

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

function _bad_test_tee_hee_hee() {
    //Not sure if the tests are actually running? Just uncomment this failing test to soothe your mind.
    assert.strictEqual(0,'0');
}
//_bad_test_tee_hee_hee();
test_normalize_discord_attachment_urls();
console.log('All tests passed!');
exit(); // Since we require the bot, we must exit the process once we are done with our tests or, like, the bot will just start running.
