# ESPCUSTOMS Música
Simple music module, built with TypeScript, used by ESP CUSTOMS.

**Docs** - https://SrGobi.github.io/espcutoms-música

## Example
`npm i -S espcutoms-música discord.js`

**ES6**:
```ts
import { Client } from 'discord.js';
import { MusicClient } from 'espcutoms-música';

const music = new MusicClient();
const bot = new Client();

music.on('trackStart', ({ textChannel }, track) => textChannel?.send(`\`${track.title}\` - **${track.requestor}** started.`));

bot.on('message', async (msg) => {
  if (msg.author.bot) return;
  
  if (msg.content === '.play') {
    const player = getPlayer(msg);
    await player.play('discord bot dashboard intro', { member: msg.member });
  }
});

function getPlayer(msg) {
  return music.get(msg.guild.id)
    ?? music.create({
      voiceChannel: msg.member.voice.channel,
      textChannel: msg.channel
    });
}

bot.login('<your_bot_token>');
```
