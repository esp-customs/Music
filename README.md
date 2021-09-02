# ESP CUSTOMS Music
Simple music module, built with TypeScript, used by ESP CUSTOMS.

## Example
`npm i -S @espcustomss/music discord.js`

**ES6**:
```ts
import { Client } from 'discord.js';
import { MusicClient } from '@espcustomss/music';

const music = new MusicClient();
const bot = new Client();

music.on('trackStart', (player, track) => player.textChannel?.send(`\`${track.title}\` - **${track.requestor}** empezado.`));

bot.on('message', async (msg) => {
  if (msg.author.bot) return;
  
  if (msg.content === '.play') {
    const player = getPlayer(msg);
    await player.play('introducción al tablero de discord bot', { member: msg.member });
  }
});

function getPlayer(msg) {
  return music.get(msg.guild.id)
    ?? music.create({
      voiceChannel: msg.member.voice.channel,
      textChannel: msg.channel
    });
}

bot.login('<el_token_de_tu_bot>');
```
