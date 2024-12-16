import { Guild, GuildMember, Message, TextChannel, VoiceChannel } from 'discord.js';
import { MusicClient } from '../src/music/client';

export class MusicCommands {
  constructor(private music: MusicClient) {}

  async play(msg: Message) {
    const player = this.getPlayer(msg);
    const query = msg.content.split('.play ')[1];
    const track = await player.play(query);
    const skipyng = await track.duration;
    const textchannel = msg.channel as TextChannel;

    if(!skipyng){
      const player = this.getPlayer(msg);
      await player.skip();
    }

    await textchannel.send(`**${track.title}** agregado a la cola.`);
  }

  async seek(msg: Message) {
    const player = this.getPlayer(msg);    
    const position = +msg.content.split('.seek ')[1];
    const textchannel = msg.channel as TextChannel;

    await player.seek(position);

    await textchannel.send(`**${player.q.peek().title}** está ahora en \`${position}s\`.`);
  }

  async q(msg: Message) {
    const player = this.getPlayer(msg);
    const details = player.q.items
      .map(track => track.title)
      .join('\n');
  
    const textchannel = msg.channel as TextChannel;
    await textchannel.send(`**Queue**:\n` + details);
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
    const guild = msg.guild as Guild;
    const member = guild.members.cache.get(msg.author.id) as GuildMember;
    return this.music.players.get(guild.id)
      ?? this.music.create(guild.id, {
        textChannel: msg.channel as TextChannel,
        voiceChannel: member.voice.channel as VoiceChannel,
        guildId: guild.id
      });
  }
}