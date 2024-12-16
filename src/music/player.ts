import { AudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnection, VoiceConnectionStatus, entersState, joinVoiceChannel, AudioResource } from '@discordjs/voice';
import { GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import searchYT, { VideoSearchResult } from 'yt-search';
import ytdl from '@distube/ytdl-core';
import Q from './q';
import { emitter } from './events';

export class MusicPlayer {
  readonly q = new Q<Track>();
  private player: AudioPlayer;
  private resource: AudioResource<null>;
  private connection?: VoiceConnection | null;

  /** Whether the queue is not empty and audio is being emitted. */
  get isPlaying() {
    return !this.q.isEmpty;
  }

  /** Whether the player is paused or not. */
  get isPaused() {
    return this.player?.state.status === AudioPlayerStatus.Paused;
  }

  /** Text channel that the player is connected to. */
  get textChannel() {
    return this.options.textChannel;
  }

  /** Voice channel that the player is connected to. */
  get voiceChannel() {
    return this.options.voiceChannel;
  }

  /** Guild ID of the player. */
  get guildId() {
    return this.options.guildId;
  }

  constructor(private options: PlayerOptions) {
    this.player = new AudioPlayer();
    emitter.on('end', async () => {
      this.q.dequeue();
      if (this.q.isEmpty) return;

      const nextTrack = this.q.peek();
      await this.playTrack(nextTrack);
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      console.log('Audio player is idle, moving to the next track.');
    });
  }

  /** Join a voice channel. */
  async join() {
    if (!this.voiceChannel?.joinable)
      throw new TypeError('Channel is not joinable.');

    const connection = joinVoiceChannel({
      channelId: this.voiceChannel.id,
      guildId: this.voiceChannel.guild.id,
      adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('Connected to the voice channel.');
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
        console.log('Reconnected to the voice channel.');
      } catch {
        console.log('Disconnected completely.');
        connection.destroy();
      }
    });

    this.connection = connection;
  }

  /** Leave a voice channel. */
  async leave() {
    await this.stop();

    this.player.stop();
    this.connection = null;
  }

  /** Joins a channel, then plays a track from YouTube.
   * If a track is already playing, it will be queued.
   * @param query Term to search YouTube for tracks.
   * @param requestor Guild member who requested to play this track.
  */
  async play(query: string, requestor?: GuildMember) {
    const { videos } = await searchYT(query);
    if (videos.length <= 0)
      throw new TypeError('No results found.');

    const track: Track = videos[0];
    track.requestor = requestor;
    this.q.enqueue(track);

    if (this.q.length <= 1) {
      // Si no estamos conectados a un canal de voz, únase antes de reproducir
      if (!this.connection) {
        await this.join();
      }
      await this.playTrack(track);
    }

    return track;
  }

  private async playTrack(track: Track) {
    if (!this.connection)
      throw new TypeError('No connection found.');

    const stream = ytdl(track.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
    this.resource = createAudioResource(stream);

    this.player.play(this.resource);

    const subscription = this.connection.subscribe(this.player);
    if (!subscription) {
      console.error('Failed to subscribe to the voice connection.');
    }

    console.log('Playing:', track.url);
  }

  /** Set volume of player.
   * @param amount Value from 0 - 1.
   */
  async setVolume(amount: number) {
    if (!this.isPlaying)
      throw new TypeError('Player is not playing anything.');

    this.resource.volume?.setVolume(amount);
  }

  /** Move position in current playing track.
   * @param position Time (in seconds) to seek to.
   */
  async seek(position: number) {
    if (!this.isPlaying)
      throw new TypeError('Player is not playing anything.');
    if (position >= this.q.peek().duration.seconds)
      throw new TypeError('Position is longer than track duration.');

    await this.playTrack(this.q.peek());
  }

  /** Stop playing and clear queue. */
  async stop() {
    if (!this.isPlaying)
      throw new TypeError('Player is not playing anything.');

    console.log('Stopping player and clearing queue.');
    this.player.stop();

    while (!this.q.isEmpty)
      this.q.dequeue();

    emitter.emit('queueEnd', this);
  }

  /** Pause playback. */
  async pause() {
    this.player.pause();
  }

  /** Resume playback. */
  async resume() {
    this.player.unpause();
  }

  /** Skip one or more tracks, and return track to play.
   * @param count Number of tracks to skip.
  */
  async skip(count = 1) {
    if (count > this.q.length)
      throw new TypeError('Not enough items to skip.');
    else if (count <= 0)
      throw new RangeError('Number to skip should be greater than 0');
    else if (this.q.length <= 1)
      throw new TypeError('Cannot skip only one track.');

    for (let i = 0; i < count; i++)
      this.q.dequeue();

    return this.playTrack(this.q.peek());
  }
}

export interface PlayerOptions {
  textChannel: TextChannel;
  voiceChannel: VoiceChannel;
  guildId: string;
}

export type Track = { requestor?: GuildMember } & VideoSearchResult;