import Q from '../../src/music/q';

describe('music/q', () => {
  let q: Q<any>;

  beforeEach(() => q = new Q<any>());

  it('enqueue adds item to q', () => {
    q.enqueue('a');
    expect(q.length).toBe(1);
  });

  it('dequeue removes item from q', () => {
    q.enqueue('a');
    q.dequeue();
    expect(q.length).toBe(0);
  });

  it('peek returns first queue item', () => {
    q.enqueue('a');
    expect(q.peek()).toBe('a');
  });

  it('shuffle randomizes array', () => {
    q.enqueue('a');
    q.enqueue('b');
    q.enqueue('c');

    while (q.items[0] === 'a') {
      q.shuffle();
    }

    expect(q.items).not.toEqual(['a', 'b', 'c']);
  });
});