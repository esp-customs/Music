import { expect } from 'chai';
import Q from '../../src/music/q';

describe('music/q', () => {
  let q: Q<any>;

  beforeEach(() => q = new Q<any>());

  it('enqueue adds item to q', () => {
    q.enqueue('a');

    expect(q.length).to.equal(1);
  });

  it('dequeue removes item from q', () => {
    q.enqueue('a');
    q.dequeue();
    
    expect(q.length).to.equal(0);
  });

  it('peek returns first queue item', () => {
    q.enqueue('a');
    
    expect(q.peek()).to.equal('a');
  });

  it('shuffle randomizes array', () => {
    q.enqueue('a');
    q.enqueue('b');
    q.enqueue('c');

    while(q.items[0] === 'a')
      q.shuffle();
    
    expect(q.items).to.not.deep.equal(['a', 'b', 'c']);
  });
});