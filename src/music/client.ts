import searchYT from 'yt-search';
import { MusicPlayer, PlayerOptions, Track } from './player';
import { emitter, MusicClientEvent } from './events';

export class MusicClient {
  /** Players for each guild. */
  readonly players = new Map<string, MusicPlayer>();

  constructor() {
    this.on('queueEnd', (player: MusicPlayer) => this.players.delete(player.guildId));
  }

  /** Listen to music client events.
   * @param event Music client event to listen to.
   * @param event Callback function for event listener.
  */
  on(event: MusicClientEvent, listener: (...args: any[]) => void) {
    emitter.on(event, listener);
  }

  /** Create a player for a guild.
   * @param guildId Guild ID of the player.
   * @param options Options for the player.
  */
  create(guildId: string, options: PlayerOptions): MusicPlayer {
    return this.players
      .set(guildId, new MusicPlayer({ guildId, ...options }))
      .get(guildId) as MusicPlayer;
  }
  /** Get a player for a guild.
   * @param guildId Guild ID of the player.
  */
  get(guildId: string): MusicPlayer {
    return this.players.get(guildId);
  }

  /** Search YouTube for tracks.
   * @param query Term to search YouTube for.
  */
  async search(query: string): Promise<Track[]> {
    const result = await searchYT(query);
    return result.videos;
  }
}

export { MusicPlayer, PlayerOptions, Track } from './player';