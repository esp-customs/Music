import { EventEmitter } from 'events';

/** @ignore */
export const emitter = new EventEmitter();

/** Eventos para escuchar.
 * 
 * `trackStart` -> cuando se inicia una pista por primera vez.</br> 
 * `queueEnd` -> cuando se borra la cola o cuando finaliza la última pista.
 */
export type MusicClientEvent = 'trackStart' | 'queueEnd';