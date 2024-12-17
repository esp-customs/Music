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
        const YOUTUBE_COOKIES = 'SID=g.a000rQgnfSbclc3A9m2Ib-2TdPOoT7CafD6cNmofvv4w3c24vMoIsE3EJMT9kZGwZDiHQBDcuwACgYKAaUSARISFQHGX2MiQGUes8MuXlK-O6dHlN7qnhoVAUF8yKqok465W-LzlSWYaFVFjJFV0076; SSID=AqedMl4J3wFqz2do9; VISITOR_INFO1_LIVE=F9MfAXJU4Jg';
        if (!this.connection)
            throw new TypeError('No connection found.');
        const stream = (0, ytdl_core_1.default)(track.url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
            requestOptions: {
                headers: {
                    'Cookie': YOUTUBE_COOKIES,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                }
            }
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL211c2ljL3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0Q0FBNks7QUFFN0ssMERBQXdEO0FBQ3hELG1FQUFzQztBQUN0Qyw0Q0FBb0I7QUFDcEIscUNBQW1DO0FBRW5DLE1BQWEsV0FBVztJQU10QixpRUFBaUU7SUFDakUsSUFBSSxTQUFTO1FBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3pCLENBQUM7SUFFRCwyQ0FBMkM7SUFDM0MsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEtBQUsseUJBQWlCLENBQUMsTUFBTSxDQUFDO0lBQ2hFLENBQUM7SUFFRCxvREFBb0Q7SUFDcEQsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUNsQyxDQUFDO0lBRUQscURBQXFEO0lBQ3JELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDbkMsQ0FBQztJQUVELDhCQUE4QjtJQUM5QixJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzlCLENBQUM7SUFFRCxZQUFvQixPQUFzQjtRQUF0QixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBOUJqQyxNQUFDLEdBQUcsSUFBSSxXQUFDLEVBQVMsQ0FBQztRQStCMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFXLEVBQUUsQ0FBQztRQUNoQyxnQkFBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDM0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTztnQkFBRSxPQUFPO1lB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