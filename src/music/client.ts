import searchYT from 'yt-search';
import { Player, PlayerOptions, Track } from './player';
import { emitter, MusicClientEvent } from './events';

export class MusicClient {
  /** miembroes para cada servidor. */
  readonly players = new Map<string, Player>();

  constructor() {
    this.on('queueEnd', (player: Player) => this.players.delete(player.guildId));
  }

  /** Escuche los eventos musicales de los clientes.
   * @param event Evento de cliente de música para escuchar.
   * @param event Función de devolución de llamada para el oyente de eventos.
  */
  on(event: MusicClientEvent, listener: (...args: any[]) => void) {
    emitter.on(event, listener);
  }

  /** Crea un miembro para un servidor.
   * @param guildId ID de servidor del miembro.
   * @param options Opciones para el miembro.
  */
  create(guildId: string, options: PlayerOptions): Player {
    return this.players
        .set(guildId, new Player({ guildId, ...options }))
        .get(guildId) as Player;
  }
  /** Consigue un miembro para un servidor.
   * @param guildId ID de servidor del miembro.
  */
  get(guildId: string): Player {
    return this.players.get(guildId);
  }
  
  /** Busque pistas en YouTube.
   * @param query Término para buscar en YouTube.
  */
  async search(query: string): Promise<Track[]> {
    const result = await searchYT(query);
    return result.videos;
  }
}

export { Player, PlayerOptions, Track } from './player';
