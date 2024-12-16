"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../../src/music/events");
const player_1 = require("../../src/music/player");
describe('music/player', () => {
    let player;
    let textChannel;
    let voiceChannel;
    let connection;
    beforeEach(() => {
        connection = {
            dispatcher: {
                paused: false,
            },
        };
        voiceChannel = {
            id: 'voice_channel_123',
            name: 'Voice',
            joinable: true,
            join: () => connection,
        };
        textChannel = {
            id: 'text_channel_123',
            name: 'General',
        };
        player = new player_1.MusicPlayer({ voiceChannel, textChannel, guildId: 'guild_123' });
    });
    describe('play', () => {
        it('joins channel', async () => {
            // Mock the join method
            const joinSpy = jest.spyOn(player, 'join');
            await player.play('test');
            expect(joinSpy).toHaveBeenCalled();
        });
        it('queue length is extended by 1', async () => {
            await player.play('test');
            expect(player.q.length).toBe(1);
        });
        it('trackStart event is emitted', async () => {
            const trackStartListener = jest.fn();
            events_1.emitter.once('trackStart', trackStartListener);
            await player.play('test');
            expect(trackStartListener).toHaveBeenCalledWith('test');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLnRlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvbi9wbGF5ZXIudGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBaUQ7QUFDakQsbURBQXFEO0FBRXJELFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO0lBQzVCLElBQUksTUFBbUIsQ0FBQztJQUN4QixJQUFJLFdBQWdCLENBQUM7SUFDckIsSUFBSSxZQUFpQixDQUFDO0lBQ3RCLElBQUksVUFBZSxDQUFDO0lBRXBCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxVQUFVLEdBQUc7WUFDWCxVQUFVLEVBQUU7Z0JBQ1YsTUFBTSxFQUFFLEtBQUs7YUFDZDtTQUNGLENBQUM7UUFDRixZQUFZLEdBQUc7WUFDYixFQUFFLEVBQUUsbUJBQW1CO1lBQ3ZCLElBQUksRUFBRSxPQUFPO1lBQ2IsUUFBUSxFQUFFLElBQUk7WUFDZCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVTtTQUN2QixDQUFDO1FBQ0YsV0FBVyxHQUFHO1lBQ1osRUFBRSxFQUFFLGtCQUFrQjtZQUN0QixJQUFJLEVBQUUsU0FBUztTQUNoQixDQUFDO1FBQ0YsTUFBTSxHQUFHLElBQUksb0JBQVcsQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDaEYsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNwQixFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzdCLHVCQUF1QjtZQUN2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsK0JBQStCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0MsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMzQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNyQyxnQkFBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMvQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=