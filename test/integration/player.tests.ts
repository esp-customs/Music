import { emitter } from '../../src/music/events';
import { MusicPlayer } from '../../src/music/player';

describe('music/player', () => {
  let player: MusicPlayer;
  let textChannel: any;
  let voiceChannel: any;
  let connection: any;

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
    player = new MusicPlayer({ voiceChannel, textChannel, guildId: 'guild_123' });
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
      emitter.once('trackStart', trackStartListener);
      await player.play('test');

      expect(trackStartListener).toHaveBeenCalledWith('test');
    });
  });
});