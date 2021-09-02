import searchYT, { VideoSearchResult } from 'yt-search';
import downloadYT from 'discord-ytdl-core';
import { GuildMember, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import Q from './q';
import { emitter } from './events';

export class Player {  
  readonly q = new Q<Track>();

  private connection?: VoiceConnection | null;

  /** Whether the queue is not empty and audio is being emitted. */
  get isPlaying() {
    return !this.q.isEmpty;
  }
  /** Whether the player is paused or not. */
  get isPaused() {
    return this.connection?.dispatcher?.paused;
  }
  /** The time (in milliseconds) that the track has been playing audio for. */
  get position() {
    return this.connection?.dispatcher?.totalStreamTime;
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
    emitter.on('end', async () => {
      this.q.dequeue();
      if (this.q.isEmpty) return;
      
      const nextTrack = this.q.peek();
      await this.playTrack(nextTrack);
    });
  }

  /** Únase a un canal de voz. */
  async join() {
    if (!this.voiceChannel?.joinable)
      throw new TypeError(`No se puede unir al canal.`);

    this.connection = await this.options.voiceChannel.join();
  }

  /** Deja un canal de voz. */
  async leave() {
    await this.stop();

    this.options.voiceChannel.leave();
    this.options.voiceChannel = null;
    this.connection = null;
  }
  
  /** Se une a un canal y luego reproduce una pista de YouTube.
   * Si una pista ya se está reproduciendo, se pondrá en cola.
   * @param query Término para buscar pistas en YouTube.
   * @param requestor Miembro del servidor que solicitó reproducir esta pista.
  */
  async play(query: string, requestor?: GuildMember) {
    const { videos } = await searchYT(query);
    if (videos.length <= 0)
      throw new TypeError('No se han encontrado resultados.');

    const track: Track = videos[0];
    track.requestor = requestor;
    this.q.enqueue(track);
    
    if (this.q.length <= 1)
      await this.playTrack(track);

    return track;
  }
  private async playTrack(track: Track, seek = 0) {
    await this.join();

    const stream = downloadYT(track.url, { fmt: 'mp3', filter: 'audioonly' });
    this.connection?.play(stream, { seek, volume: 1 });
    
    if (seek <= 0)
      emitter.emit('trackStart', this, track);

    return track;
  }

  /** Establecer el volumen del miembro.
   * @param amount Valor de 0 a 1.
   */ 
  async setVolume(amount: number) {
    if (!this.isPlaying)
      throw new TypeError('El miembro no está escuchando nada.');

    this.connection.dispatcher.setVolume(amount);
  }

  /** Mover la posición en la pista de reproducción actual.
   * @param position Tiempo (en segundos) para buscar.
   */ 
  async seek(position: number) {
    if (!this.isPlaying)
      throw new TypeError('El miembro no está jugando nada.');
    if (position >= this.q.peek().duration.seconds)
      throw new TypeError('La posición es más larga que la duración de la pista.');

    await this.playTrack(this.q.peek(), position);
  }

  /** Deja de jugar y despeja la cola. */
  async stop() {
    this.connection?.disconnect();

    while (!this.q.isEmpty)
      this.q.dequeue();

    emitter.emit('queueEnd', this);
  }

  /** Pausar la reproducción. */
  async pause() {
    this.connection?.dispatcher.pause();
  }
  /** Resume playback. */
  async resume() {
    this.connection?.dispatcher.resume();
  }

  /** Omita una o más pistas y vuelva a reproducir la pista.
   * @param count Número de pistas para saltar.
  */
  async skip(count = 1) {
    if (count > this.q.length)
      throw new TypeError('No hay suficientes elementos para omitir.');
    else if (count <= 0)
      throw new RangeError('El número que se debe omitir debe ser mayor que 0');
    else if (this.q.length <= 1)
      throw new TypeError('No se puede omitir solo una pista.');
    
    for (let i = 0; i < count; i++)     
      this.q.dequeue();
  
    return this.playTrack(this.q.peek());
  }
}

export interface PlayerOptions {
  textChannel: TextChannel;
  voiceChannel: VoiceChannel;
  guildId?: string;
}

export type Track = { requestor?: GuildMember } & VideoSearchResult;
