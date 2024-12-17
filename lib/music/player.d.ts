import { VoiceConnection } from '@discordjs/voice';
import { GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { VideoSearchResult } from 'yt-search';
import Q from './q';
export declare class MusicPlayer {
    private options;
    readonly q: Q<Track>;
    private player;
    private resource;
    private connection?;
    /** Whether the queue is not empty and audio is being emitted. */
    get isPlaying(): boolean;
    /** Whether the player is paused or not. */
    get isPaused(): boolean;
    /** Text channel that the player is connected to. */
    get textChannel(): TextChannel;
    /** Voice channel that the player is connected to. */
    get voiceChannel(): VoiceChannel;
    /** Guild ID of the player. */
    get guildId(): string;
    constructor(options: PlayerOptions);
    /** Join a voice channel. */
    join(): Promise<VoiceConnection>;
    /** Leave a voice channel. */
    leave(): Promise<void>;
    /** Joins a channel, then plays a track from YouTube.
     * If a track is already playing, it will be queued.
     * @param query Term to search YouTube for tracks.
     * @param requestor Guild member who requested to play this track.
    */
    play(query: string, requestor?: GuildMember): Promise<Track>;
    private playTrack;
    /** Set volume of player.
     * @param amount Value from 0 - 1.
     */
    setVolume(amount: number): Promise<void>;
    /** Move position in current playing track.
     * @param position Time (in seconds) to seek to.
     */
    seek(position: number): Promise<Track>;
    /** Stop playing and clear queue. */
    stop(): Promise<void>;
    /** Pause playback. */
    pause(): Promise<void>;
    /** Resume playback. */
    resume(): Promise<void>;
    /** Skip one or more tracks, and return track to play.
     * @param count Number of tracks to skip.
    */
    skip(count?: number): Promise<Track>;
}
export interface PlayerOptions {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    guildId: string;
}
export type Track = {
    requestor?: GuildMember;
} & VideoSearchResult;
