"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayer = void 0;
const voice_1 = require("@discordjs/voice");
const yt_search_1 = __importDefault(require("yt-search"));
const ytdl_core_1 = __importDefault(require("@distube/ytdl-core"));
const fs_1 = __importDefault(require("fs"));
const q_1 = __importDefault(require("./q"));
const events_1 = require("./events");
class MusicPlayer {
    /** Whether the queue is not empty and audio is being emitted. */
    get isPlaying() {
        return !this.q.isEmpty;
    }
    /** Whether the player is paused or not. */
    get isPaused() {
        return this.player?.state.status === voice_1.AudioPlayerStatus.Paused;
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
    constructor(options) {
        this.options = options;
        this.q = new q_1.default();
        this.player = new voice_1.AudioPlayer();
        events_1.emitter.on('end', async () => {
            this.q.dequeue();
            if (this.q.isEmpty)
                return;
            const nextTrack = this.q.peek();
            await this.playTrack(nextTrack);
        });
    }
    /** Join a voice channel. */
    async join() {
        if (!this.voiceChannel?.joinable)
            throw new TypeError('Channel is not joinable.');
        const connection = (0, voice_1.joinVoiceChannel)({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guild.id,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
        connection.on(voice_1.VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Signalling, 5000),
                    (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Connecting, 5000),
                ]);
            }
            catch {
                connection.destroy();
            }
        });
        return this.connection = connection;
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
    async play(query, requestor) {
        const { videos } = await (0, yt_search_1.default)(query);
        if (videos.length <= 0)
            throw new TypeError('No results found.');
        const track = videos[0];
        track.requestor = requestor;
        this.q.enqueue(track);
        if (this.q.length <= 1) {
            // Si no estamos conectados a un canal de voz, únase antes de reproducir
            if (!this.connection) {
                await this.join();
            }
            return await this.playTrack(track);
        }
        return track;
    }
    async playTrack(track, seek = 0) {
        if (!this.connection)
            throw new TypeError('No connection found.');
        const agent = ytdl_core_1.default.createAgent(JSON.parse(fs_1.default.readFileSync('cookies.json', 'utf-8')));
        const stream = (0, ytdl_core_1.default)(track.url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
            agent
        });
        this.resource = (0, voice_1.createAudioResource)(stream, { inlineVolume: true });
        this.player.play(this.resource);
        const subscription = this.connection.subscribe(this.player);
        if (!subscription) {
            throw new TypeError('Failed to subscribe to connection.');
        }
        if (seek <= 0)
            events_1.emitter.emit('trackStart', this, track);
        return track;
    }
    /** Set volume of player.
     * @param amount Value from 0 - 1.
     */
    async setVolume(amount) {
        if (!this.isPlaying)
            throw new TypeError('Player is not playing anything.');
        return this.resource.volume?.setVolume(amount);
    }
    /** Move position in current playing track.
     * @param position Time (in seconds) to seek to.
     */
    async seek(position) {
        if (!this.isPlaying)
            throw new TypeError('Player is not playing anything.');
        if (position >= this.q.peek().duration.seconds)
            throw new TypeError('Position is longer than track duration.');
        return await this.playTrack(this.q.peek(), position);
    }
    /** Stop playing and clear queue. */
    async stop() {
        if (!this.isPlaying)
            throw new TypeError('Player is not playing anything.');
        this.player.stop(true);
        while (!this.q.isEmpty)
            this.q.dequeue();
        events_1.emitter.emit('queueEnd', this);
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
exports.MusicPlayer = MusicPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL211c2ljL3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0Q0FBNks7QUFFN0ssMERBQXdEO0FBQ3hELG1FQUFzQztBQUN0Qyw0Q0FBb0I7QUFDcEIsNENBQW9CO0FBQ3BCLHFDQUFtQztBQUVuQyxNQUFhLFdBQVc7SUFNdEIsaUVBQWlFO0lBQ2pFLElBQUksU0FBUztRQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxLQUFLLHlCQUFpQixDQUFDLE1BQU0sQ0FBQztJQUNoRSxDQUFDO0lBRUQsb0RBQW9EO0lBQ3BELElBQUksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDbEMsQ0FBQztJQUVELHFEQUFxRDtJQUNyRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO0lBQ25DLENBQUM7SUFFRCw4QkFBOEI7SUFDOUIsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBb0IsT0FBc0I7UUFBdEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQTlCakMsTUFBQyxHQUFHLElBQUksV0FBQyxFQUFTLENBQUM7UUErQjFCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQkFBVyxFQUFFLENBQUM7UUFDaEMsZ0JBQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU87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