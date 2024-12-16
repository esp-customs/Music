import { Client, Events, GatewayIntentBits, Message } from 'discord.js';
import { MusicClient } from '../src/music/client';
import { MusicCommands } from './commands';

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
  ]
});
const music = new MusicClient();  // Pasamos el bot a MusicClient
const commands = new MusicCommands(music);

music.on('trackStart', (player, track) => {
  player.textChannel?.send(`**${track.title}** ha comenzado.`);
});

music.on('queueEnd', (player) => {
  player.textChannel?.send('La cola ha terminado.');
});

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.once(Events.MessageCreate, async (msg: Message) => {
  try {
    if (msg.content.startsWith('.play ')) {
      console.log('play');
      await commands.play(msg);
    } else if (msg.content.startsWith('.seek ')) {
      await commands.seek(msg);
    } else if (msg.content.startsWith('.stop')) {
      console.log('stop');
      await commands.stop(msg);
    } else if (msg.content === '.q') {
      await commands.q(msg);
    } else if (msg.content === '.skip') {
      await commands.skip(msg);
    }
  } catch (error) {
    console.log(error);
  }
});

client.login('<TOKEN>');