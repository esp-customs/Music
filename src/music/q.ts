export default class Q<T> {
  private _items: T[] = [];

  get isEmpty() {
    return this.items.length <= 0;
  }
  get length() {
    return this.items.length;
  }
  get items() {
    return this._items;
  }

  enqueue(item: T) {
    this.items.push(item);
  }

  dequeue() {
    this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  shuffle() {
    for (var i = this.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [this.items[i], this.items[rand]] = [this.items[rand], this.items[i]]
    }
  }
}
