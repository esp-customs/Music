# ![ESP CUSTOMS Music](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=500&size=40&pause=1000&color=5865F2&multiline=true&random=false&width=435&lines=ESP+CUSTOMS+Music)

<p align="center">
  <a href="https://nodei.co/npm/@espcustomss/music/"><img src="https://nodei.co/npm/@espcustomss/music.png"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/npm/v/@espcustomss/music?style=for-the-badge">
  <img src="https://img.shields.io/npm/dm/@espcustomss/music?style=for-the-badge">
  <img src="https://img.shields.io/bundlephobia/minzip/@espcustomss/music?style=for-the-badge" alt="size">
  <a href="https://discord.gg/cqrN3Eg" target="_blank">
    <img alt="Discord" src="https://img.shields.io/badge/Support-Click%20here-7289d9?style=for-the-badge&logo=discord">
  </a>
</p>

## 🚀 How to Install?

```bash
npm i @espcustomss/music
```

# ✨Features

- 🎶 **Music Playback for Discord** - Easily integrate music playback in your Discord bot.

- 🔒 **TypeScript support** - Fully written in TypeScript with type definitions.

- 🚀 **Simple API** - Fast and intuitive music control commands, perfect for developers of all levels.

- 🔊 **Queue Management** - Handle play, skip, pause, stop, seek, and more music-related functions.

- 🎧 **Voice Channel Integration** - Automatically joins and leaves voice channels.

- 🛠️ **Extensible** - Easily add or modify commands with the built-in MusicCommands class.

# 📦 Usage

For **CommonJS**:
```javascript
const { Client } = require('discord.js');
const { MusicClient } = require('@espcustomss/music');

const music = new MusicClient();
const bot = new Client();

music.on('trackStart', (player, track) => {
  player.textChannel?.send(`\`${track.title}\` - **${track.requestor}** has started.`);
});

bot.on('message', async (msg) => {
  if (msg.author.bot) return;
  
  if (msg.content === '.play') {
    const player = getPlayer(msg);
    await player.play('intro to Discord bot', { member: msg.member });
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

For **EsModule** And **TypeScript**
```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { MusicClient } from '@espcustomss/music';

const music = new MusicClient();
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

music.on('trackStart', (player, track) => player.textChannel?.send(`\`${track.title}\` - **${track.requestor}** started.`));

bot.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === '.play') {
    const player = getPlayer(msg);
    await player.play('intro to Discord bot', { member: msg.member });
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
## 🎼 Music Commands
The MusicCommands class includes a variety of useful methods to control music playback. Here are a few examples:

- ``.play:`` Play a song in the voice channel.
- ``.seek:`` Seek to a specific position in the current track.
- ``.skip:`` Skip the current track.
- ``.stop:`` Stop the playback and clear the queue.
- ``.pause:`` Pause the current track.
- ``.resume:`` Resume playback.
- ``.volume:`` Set the playback volume.

### Example:
```ts
import { MusicCommands } from '@espcustomss/music';

const musicCommands = new MusicCommands(music);

bot.on('messageCreate', async (msg) => {
  if (msg.content.startsWith('.play ')) {
    await musicCommands.play(msg);
  } else if (msg.content === '.stop') {
    await musicCommands.stop(msg);
  }
  // Add other commands as needed
});
```

## 📚 Documentation
For a complete list of commands, events, and available methods, refer to the full documentation.

### 🛠️ Example - Play Command
```typescript
// Handling .play command to play a song
async play(msg: Message) {
  const player = this.getPlayer(msg);
  const query = msg.content.split('.play ')[1];
  const track = await player.play(query);

  const textChannel = msg.channel as TextChannel;
  return textChannel.send(`**${track.title}** added to the queue.`);
}
```
## 💬 Support
If you need help or want to contribute to the project, feel free to join our Discord server.

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.