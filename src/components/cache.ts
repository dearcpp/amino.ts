import AminoClient, { IAminoStorage } from "../index";

export default class IAminoCache<T> {

    public limit: number;
    private storage: Array<T> = new Array<T>();

    /**
    * IAminoCache<T> constructor
    * @param {T[]} [limit] cache limit
    */
    constructor(limit: number) {
        this.limit = limit;
    }

    /**
    * Add new items to the cache
    * @param {T[]} [items] new items
    */
    public push(...items: T[]): number {
        if (this.storage.length + 1 > this.limit) {
            this.storage.shift();
        }
        return this.storage.push(...items);
    }

    /**
    * Get count of elements
    */
    public length(): number {
        return this.storage.length;
    }

    /**
    * Get local cache copy
    */
    public get(): T[] {
        return [...this.storage];
    }

};
