import { expect, spy } from 'chai';
import { emitter } from '../../src/music/events';
import { Player } from '../../src/music/player';

describe('music/player', () => {
  let player: Player;
  let textChannel: any;
  let voiceChannel: any;
  let connection: any;

  beforeEach(() => {
    connection = {
      dispatcher: {
        paused: false
      }
    };
    voiceChannel = {
      id: 'voice_channel_123',
      name: 'Voice',
      joinable: true,
      join: () => connection
    };
    textChannel = {
      id: 'text_channel_123',
      name: 'General'
    };
    player = new Player({ voiceChannel, textChannel })
  });

  describe('play', () => {
    it('joins channel', async () => {
      const spied = spy.on(player, 'join');
      await player.play('test');

      expect(spied).to.have.been.called();
    });

    it('queue length is extended by 1', async () => {
      await player.play('test');

      expect(player.q.length).to.equal(1);
    });

    it('trackStart event is emitted', async () => {
      await player.play('test');

      emitter.should.emit('trackStart');
    });
  });
});