import { Message, TextChannel } from 'discord.js';
import { MusicClient } from '../src/music/client';

export class MusicCommands {
  constructor(private music: MusicClient) {}

  async play(msg: Message) {
    const player = this.getPlayer(msg);
    const query = msg.content.split('.play ')[1];
    const track = await player.play(query);

    await msg.channel.send(`**${track.title}** added to queue.`);
  }

  async seek(msg: Message) {
    const player = this.getPlayer(msg);    
    const position = +msg.content.split('.seek ')[1];    

    await player.seek(position);

    await msg.channel.send(`**${player.q.peek().title}** is now at \`${position}s\`.`);
  }

  async q(msg: Message) {
    const player = this.getPlayer(msg);
    const details = player.q.items
      .map(track => track.title)
      .join('\n');
  
    await msg.channel.send(`**Queue**:\n` + details);
  }

  async skip(msg: Message) {
    const player = this.getPlayer(msg);
    await player.skip();
  }

  async stop(msg: Message) {
    const player = this.getPlayer(msg);
    await player.stop();
  }

  private getPlayer(msg: Message) {  
    return this.music.players.get(msg.guild.id)
      ?? this.music.create(msg.guild.id, {
        textChannel: msg.channel as TextChannel,
        voiceChannel: msg.member.voice.channel
      });
  }
}