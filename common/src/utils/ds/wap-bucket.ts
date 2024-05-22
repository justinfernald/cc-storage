/**
 * Represents a bucket that stores values associated with keys.
 * @template K The type of the keys.
 * @template V The type of the values.
 */
export class WapBucket<K, V> {
    rawMap: Map<K, V[]>;

    /**
     * Creates a new WapBucket instance from an array of key-value pairs.
     * @param entries An array of key-value pairs.
     * @returns A new WapBucket instance.
     */
    static fromWapBucketValues<K, V>(entries: [K, V[]][]): WapBucket<K, V> {
        return new WapBucket(entries);
    }

    /**
     * Groups an array of values by a specified key.
     * @param array The array of values to group.
     * @param keyFn A function that returns the key for each value.
     * @returns A new WapBucket instance with the values grouped by key.
     */
    static groupBy<T, K extends string | number | symbol>(
        array: T[],
        keyFn: (item: T) => K,
    ): WapBucket<K, T> {
        const map = new Map<K, T[]>();
        array.forEach((item) => {
            const key = keyFn(item);
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(item);
        });
        return new WapBucket(Array.from(map.entries()));
    }

    /**
     * Groups an array of values by a specified key and applies a value transformation function.
     * @param array The array of values to group.
     * @param keyFn A function that returns the key for each value.
     * @param valueFn A function that transforms each value based on the key.
     * @returns A new WapBucket instance with the transformed values grouped by key.
     */
    static groupByMapped<T, K extends string | number | symbol, V>(
        array: T[],
        keyFn: (item: T) => K,
        valueFn: (item: T, key: K) => V,
    ): WapBucket<K, V> {
        const map = new Map<K, V[]>();
        array.forEach((item) => {
            const key = keyFn(item);
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(valueFn(item, key));
        });
        return new WapBucket(Array.from(map.entries()));
    }

    /**
     * Creates a new WapBucket instance.
     * @param entries An optional array of key-value pairs to initialize the bucket.
     */
    constructor(entries: [K, V[]][] | null = null) {
        this.rawMap = new Map(entries);
    }

    /**
     * Sets the values associated with a key in the bucket.
     * @param key The key.
     * @param values The values to set.
     * @returns The WapBucket instance.
     */
    set(key: K, values: V[]): this {
        this.rawMap.set(key, values);
        return this;
    }

    /**
     * Adds a value to the bucket associated with a key.
     * @param key The key.
     * @param value The value to add.
     * @returns The WapBucket instance.
     */
    addValue(key: K, value: V): this {
        if (!this.rawMap.has(key)) {
            this.rawMap.set(key, []);
        }
        this.rawMap.get(key)!.push(value);
        return this;
    }

    /**
     * Gets the values associated with a key in the bucket.
     * @param key The key.
     * @returns An array of values associated with the key, or an empty array if the key is not found.
     */
    get(key: K): V[] {
        return this.rawMap.get(key) ?? [];
    }

    /**
     * Gets the values associated with a key in the bucket, or sets the values if the key is not found.
     * @param key The key.
     * @param values The values to set if the key is not found.
     * @returns An array of values associated with the key.
     */
    getElseSet(key: K, values: V[]): V[];
    /**
     * Gets the values associated with a key in the bucket, or sets the values using a value factory function if the key is not found.
     * @param key The key.
     * @param valueFactory A function that returns the values to set if the key is not found.
     * @returns An array of values associated with the key.
     */
    getElseSet(key: K, valueFactory: () => V[]): V[];
    getElseSet(key: K, valuesOrValueFactory: V[] | (() => V[])): V[] {
        if (!this.has(key)) {
            if (typeof valuesOrValueFactory === 'function') {
                this.set(key, (valuesOrValueFactory as () => V[])());
            } else {
                this.set(key, valuesOrValueFactory);
            }
        }

        return this.get(key);
    }

    /**
     * Checks if a key exists in the bucket.
     * @param key The key.
     * @returns `true` if the key exists, `false` otherwise.
     */
    has(key: K): boolean {
        return this.rawMap.has(key);
    }

    /**
     * Checks if a value exists in the bucket associated with a key.
     * @param key The key.
     * @param value The value.
     * @returns `true` if the value exists, `false` otherwise.
     */
    hasValue(key: K, value: V): boolean {
        const bucket = this.rawMap.get(key);
        return bucket ? bucket.includes(value) : false;
    }

    /**
     * Deletes a key and its associated values from the bucket.
     * @param key The key to delete.
     * @returns `true` if the key was found and deleted, `false` otherwise.
     */
    delete(key: K): boolean {
        return this.rawMap.delete(key);
    }

    /**
     * Removes a value from the bucket associated with a key.
     * @param key The key.
     * @param value The value to remove.
     * @returns `true` if the value was found and removed, `false` otherwise.
     */
    removeValue(key: K, value: V): boolean {
        if (!this.has(key)) return false;
        const bucket = this.rawMap.get(key)!;
        const index = bucket.indexOf(value);
        if (index !== -1) {
            bucket.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Clears the bucket, removing all keys and values.
     */
    clear(): void {
        this.rawMap.clear();
    }

    /**
     * Gets the number of keys in the bucket.
     */
    get size(): number {
        return this.rawMap.size;
    }

    /**
     * Checks if the bucket is empty.
     */
    get isEmpty(): boolean {
        return this.size === 0;
    }

    /**
     * Gets an array of all keys in the bucket.
     * @returns An array of keys.
     */
    keys(): K[] {
        return Array.from(this.rawMap.keys());
    }

    /**
     * Gets an array of all values in the bucket.
     * @returns An array of arrays of values.
     */
    values(): V[][] {
        return Array.from(this.rawMap.values());
    }

    /**
     * Gets an array of all key-value pairs in the bucket.
     * @returns An array of key-value pairs.
     */
    entries(): [K, V[]][] {
        return Array.from(this.rawMap.entries());
    }

    /**
     * Creates a new WapBucket instance by applying a transformation function to the values of each key.
     * @param f A function that transforms the values of each key.
     * @returns A new WapBucket instance with the transformed values.
     */
    mapValues<NV>(f: (values: V[], key: K) => NV[]): WapBucket<K, NV> {
        const newMap = new WapBucket<K, NV>();

        this.forEach((values, key) => {
            newMap.set(key, f(values, key));
        });

        return newMap;
    }

    /**
     * Creates a new WapBucket instance by applying a transformation function to the keys of each key-value pair.
     * @param f A function that transforms the keys of each key-value pair.
     * @returns A new WapBucket instance with the transformed keys.
     */
    mapKeys<NK>(f: (key: K, values: V[]) => NK): WapBucket<NK, V> {
        const newMap = new WapBucket<NK, V>();

        this.forEach((values, key) => {
            newMap.set(f(key, values), values);
        });

        return newMap;
    }

    /**
     * Creates a new WapBucket instance by applying a transformation function to the keys and values of each key-value pair.
     * @param f A function that transforms the keys and values of each key-value pair.
     * @returns A new WapBucket instance with the transformed keys and values.
     */
    mapKeysAndValues<NK, NV>(f: (key: K, values: V[]) => [NK, NV[]]): WapBucket<NK, NV> {
        const newMap = new WapBucket<NK, NV>();

        this.forEach((values, key) => {
            const [newKey, newValues] = f(key, values);
            newMap.set(newKey, newValues);
        });

        return newMap;
    }

    /**
     * Executes a provided function once for each key-value pair in the bucket.
     * @param callbackfn A function that is called for each key-value pair.
     * @param thisArg An optional value to use as `this` when executing the callback function.
     */
    forEach(
        callbackfn: (values: V[], key: K, map: WapBucket<K, V>) => void,
        thisArg?: unknown,
    ): void {
        this.rawMap.forEach((values, key) => callbackfn.call(thisArg, values, key, this));
    }

    /**
     * Merges the values of another WapBucket instance into this bucket.
     * @param other The other WapBucket instance to merge.
     * @returns The WapBucket instance.
     */
    merge(other: WapBucket<K, V>): this {
        other.forEach((values, key) => {
            if (this.rawMap.has(key)) {
                this.rawMap.get(key)!.push(...values);
            } else {
                this.set(key, values);
            }
        });
        return this;
    }

    /**
     * Creates a new WapBucket instance with only the key-value pairs that satisfy a predicate function.
     * @param predicate A function that tests each key-value pair.
     * @returns A new WapBucket instance with the filtered key-value pairs.
     */
    filter(predicate: (values: V[], key: K) => boolean): WapBucket<K, V> {
        const newMap = new WapBucket<K, V>();
        this.forEach((values, key) => {
            if (predicate(values, key)) {
                newMap.set(key, values);
            }
        });
        return newMap;
    }

    /**
     * Reduces the values of each key-value pair to a single value.
     * @param reducer A function that reduces the values of each key-value pair.
     * @param initialValue The initial value for the reducer.
     * @returns The reduced value.
     */
    reduce<T>(reducer: (accumulator: T, values: V[], key: K) => T, initialValue: T): T {
        let accumulator = initialValue;
        this.forEach((values, key) => {
            accumulator = reducer(accumulator, values, key);
        });
        return accumulator;
    }

    /**
     * Creates a shallow copy of the WapBucket instance.
     * @returns A new WapBucket instance with the same key-value pairs.
     */
    clone(): WapBucket<K, V> {
        return WapBucket.fromWapBucketValues(this.entries());
    }

    /**
     * Converts the WapBucket instance to a Record object.
     * @returns A Record object with the keys and values of the WapBucket instance.
     * @throws An error if a key is not a valid Record key type (string, number, or symbol).
     */
    toRecord(): Record<string | number | symbol, V[]> {
        const record = {} as Record<string | number | symbol, V[]>;
        this.rawMap.forEach((values, key) => {
            if (typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'symbol') {
                throw new Error(`Key [${key}] is not a valid Record key type`);
            }
            record[key as string | number | symbol] = values;
        });
        return record;
    }

    /**
     * Returns an iterator that iterates over the key-value pairs in the bucket.
     * @returns An iterator for the key-value pairs.
     */
    [Symbol.iterator](): IterableIterator<[K, V[]]> {
        return this.entries()[Symbol.iterator]();
    }
}
