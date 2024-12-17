import { Client, Events, GatewayIntentBits, Message } from 'discord.js';
import { MusicClient } from '../src/music/client';
import { MusicCommands } from './commands';

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
  ]
});

const music = new MusicClient();  // Inicializamos MusicClient
const commands = new MusicCommands(music);

// Manejar evento trackStart para enviar mensaje cuando empiece una canción
music.on('trackStart', (player, track) => {
  if (player.textChannel) {
    player.textChannel.send(`**${track.title}** ha comenzado.`);
  }
});

// Manejar evento queueEnd para enviar mensaje cuando se termine la cola
music.on('queueEnd', (player) => {
  if (player.textChannel) {
    player.textChannel.send('La cola ha terminado.');
  }
});

// Evento cuando el bot se conecta correctamente
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Manejar los mensajes de los usuarios
client.on(Events.MessageCreate, async (msg: Message) => {
  if (msg.author.bot) return;  // Ignorar los mensajes de otros bots

  console.log('Contenido del mensaje: ', msg.content);

  try {
    // Verificar qué comando se está utilizando y ejecutar la función correspondiente
    if (msg.content.startsWith('.seek ')) {
      await commands.seek(msg);
    } else if (msg.content.startsWith('.play ')) {
      await commands.play(msg);
    } else if (msg.content === '.stop') {
      await commands.stop(msg);
    } else if (msg.content === '.q') {
      await commands.q(msg);
    } else if (msg.content === '.skip') {
      await commands.skip(msg);
    } else if (msg.content === '.leave') {
      await commands.leave(msg);
    } else if (msg.content === '.resume') {
      await commands.resume(msg);
    } else if (msg.content === '.pause') {
      await commands.pause(msg);
    } else if (msg.content.startsWith('.volume ')) {
      await commands.volume(msg);
    } else {
      console.log('Comando no reconocido: ', msg.content);
    }
  } catch (error) {
    console.error('Error al procesar el comando:', error);
  }
});

// Conectar el bot con el token de la aplicación
client.login('<your_bot_token>');