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
        this.player.on(voice_1.AudioPlayerStatus.Idle, () => {
            console.log('Audio player is idle, moving to the next track.');
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
        connection.on(voice_1.VoiceConnectionStatus.Ready, () => {
            console.log('Connected to the voice channel.');
        });
        connection.on(voice_1.VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Signalling, 5000),
                    (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Connecting, 5000),
                ]);
                console.log('Reconnected to the voice channel.');
            }
            catch {
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
            await this.playTrack(track);
        }
        return track;
    }
    async playTrack(track) {
        if (!this.connection)
            throw new TypeError('No connection found.');
        const stream = (0, ytdl_core_1.default)(track.url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25
        });
        ytdl_core_1.default.createAgent(JSON.parse(fs_1.default.readFileSync('cookies.json', 'utf-8')));
        this.resource = (0, voice_1.createAudioResource)(stream, { inlineVolume: true });
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
    async setVolume(amount) {
        if (!this.isPlaying)
            throw new TypeError('Player is not playing anything.');
        this.resource.volume?.setVolume(amount);
    }
    /** Move position in current playing track.
     * @param position Time (in seconds) to seek to.
     */
    async seek(position) {
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