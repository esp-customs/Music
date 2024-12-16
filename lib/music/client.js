"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayer = exports.MusicClient = void 0;
const yt_search_1 = __importDefault(require("yt-search"));
const player_1 = require("./player");
const events_1 = require("./events");
class MusicClient {
    constructor() {
        /** Players for each guild. */
        this.players = new Map();
        this.on('queueEnd', (player) => this.players.delete(player.guildId));
    }
    /** Listen to music client events.
     * @param event Music client event to listen to.
     * @param event Callback function for event listener.
    */
    on(event, listener) {
        events_1.emitter.on(event, listener);
    }
    /** Create a player for a guild.
     * @param guildId Guild ID of the player.
     * @param options Options for the player.
    */
    create(guildId, options) {
        return this.players
            .set(guildId, new player_1.MusicPlayer({ guildId, ...options }))
            .get(guildId);
    }
    /** Get a player for a guild.
     * @param guildId Guild ID of the player.
    */
    get(guildId) {
        return this.players.get(guildId);
    }
    /** Search YouTube for tracks.
     * @param query Term to search YouTube for.
    */
    async search(query) {
        const result = await (0, yt_search_1.default)(query);
        return result.videos;
    }
}
exports.MusicClient = MusicClient;
var player_2 = require("./player");
Object.defineProperty(exports, "MusicPlayer", { enumerable: true, get: function () { return player_2.MusicPlayer; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL211c2ljL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwREFBaUM7QUFDakMscUNBQTZEO0FBQzdELHFDQUFxRDtBQUVyRCxNQUFhLFdBQVc7SUFJdEI7UUFIQSw4QkFBOEI7UUFDckIsWUFBTyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBR2hELElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBbUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVEOzs7TUFHRTtJQUNGLEVBQUUsQ0FBQyxLQUF1QixFQUFFLFFBQWtDO1FBQzVELGdCQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7OztNQUdFO0lBQ0YsTUFBTSxDQUFDLE9BQWUsRUFBRSxPQUFzQjtRQUM1QyxPQUFPLElBQUksQ0FBQyxPQUFPO2FBQ2hCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxvQkFBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUN0RCxHQUFHLENBQUMsT0FBTyxDQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFDRDs7TUFFRTtJQUNGLEdBQUcsQ0FBQyxPQUFlO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOztNQUVFO0lBQ0YsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFhO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxtQkFBUSxFQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0NBQ0Y7QUF2Q0Qsa0NBdUNDO0FBRUQsbUNBQTZEO0FBQXBELHFHQUFBLFdBQVcsT0FBQSJ9