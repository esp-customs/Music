import searchYT from 'yt-search';
import { Player, PlayerOptions, Track } from './player';
import { emitter, MusicClientEvent } from './events';

export class MusicClient {
  /** Jugadores para cada gremio. */
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

  /** Crea un jugador para un gremio.
   * @param guildId ID de gremio del jugador.
   * @param options Opciones para el jugador.
  */
  create(guildId: string, options: PlayerOptions): Player {
    return this.players
        .set(guildId, new Player({ guildId, ...options }))
        .get(guildId) as Player;
  }
  /** Consigue un jugador para un gremio.
   * @param guildId ID de gremio del jugador.
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
