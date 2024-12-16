export default class Q<T> {
    private _items;
    get isEmpty(): boolean;
    get length(): number;
    get items(): T[];
    enqueue(item: T): void;
    dequeue(): void;
    peek(): T;
    shuffle(): void;
}
