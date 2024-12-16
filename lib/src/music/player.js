"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayer = void 0;
const voice_1 = require("@discordjs/voice");
const yt_search_1 = __importDefault(require("yt-search"));
const ytdl_core_1 = __importDefault(require("@distube/ytdl-core"));
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
        const stream = (0, ytdl_core_1.default)(track.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
        this.resource = (0, voice_1.createAudioResource)(stream);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL211c2ljL3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0Q0FBNks7QUFFN0ssMERBQXdEO0FBQ3hELG1FQUFzQztBQUN0Qyw0Q0FBb0I7QUFDcEIscUNBQW1DO0FBRW5DLE1BQWEsV0FBVztJQU10QixpRUFBaUU7SUFDakUsSUFBSSxTQUFTO1FBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3pCLENBQUM7SUFFRCwyQ0FBMkM7SUFDM0MsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEtBQUsseUJBQWlCLENBQUMsTUFBTSxDQUFDO0lBQ2hFLENBQUM7SUFFRCxvREFBb0Q7SUFDcEQsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUNsQyxDQUFDO0lBRUQscURBQXFEO0lBQ3JELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDbkMsQ0FBQztJQUVELDhCQUE4QjtJQUM5QixJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzlCLENBQUM7SUFFRCxZQUFvQixPQUFzQjtRQUF0QixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBOUJqQyxNQUFDLEdBQUcsSUFBSSxXQUFDLEVBQVMsQ0FBQztRQStCMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFXLEVBQUUsQ0FBQztRQUNoQyxnQkFBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDM0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTztnQkFBRSxPQUFP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