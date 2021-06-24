import { Client } from 'discord.js';
import { MusicClient, Player, Track } from '../src/music/client';
import { MusicCommands } from './commands';

const bot = new Client();
const music = new MusicClient();
const commands = new MusicCommands(music);

music.on('trackStart', (player: Player, track: Track) => player.textChannel?.send(`**${track.title}** started.`));
music.on('queueEnd', (player: Player) => player.textChannel?.send(`Queue has ended.`));

bot.on('message', async (msg) => {
  if (msg.author.bot) return;

  try {
    if (msg.content.startsWith('.play '))
      await commands.play(msg);
    if (msg.content.startsWith('.seek '))
      await commands.seek(msg);
    else if (msg.content === '.stop')
      await commands.stop(msg);
    else if (msg.content === '.q')
      await commands.q(msg);
    else if (msg.content === '.skip')
      await commands.skip(msg);
  } catch (error) {
    await msg.reply(error?.message);
  }
});

bot.on('ready', () => console.log('Bot logged in!'))

bot.login('NzUxNDkzODI5MjAyNDExNzAw.X1J5Kg.f80jQ1I13zZw2BbZWtCgalPhFIM');
