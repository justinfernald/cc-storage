/**
 * Represents a generic key-value map.
 * @template K The type of the keys in the map.
 * @template V The type of the values in the map.
 */
export class Wap<K, V> {
  rawMap: Map<K, V>;

  /**
   * Creates a new Wap instance from a record object.
   * @param record The record object to create the map from.
   * @returns A new Wap instance.
   */
  static fromRecord<K extends string | number | symbol, V>(
    record: Record<K, V>,
  ): Wap<K, V> {
    const entries = Object.entries(record) as [K, V][];
    return new Wap(entries);
  }

  /**
   * Creates a new Wap instance from an array of values and a key function.
   * @param array The array of values to create the map from.
   * @param keyFn The function to extract the key from each value.
   * @returns A new Wap instance.
   */
  static fromArray<K, V>(array: V[], keyFn: (item: V) => K): Wap<K, V> {
    const entries = array.map((item) => [keyFn(item), item] as [K, V]);
    return new Wap(entries);
  }

  /**
   * Creates a new Wap instance from an array of values and key-value mapping functions.
   * @param array The array of values to create the map from.
   * @param keyFn The function to extract the key from each value.
   * @param valueFn The function to compute the value for each key-value pair.
   * @returns A new Wap instance.
   */
  static fromArrayMapped<T, K extends string | number | symbol, V>(
    array: T[],
    keyFn: (item: T) => K,
    valueFn: (item: T, key: K) => V,
  ): Wap<K, V> {
    const entries = array.map((item) => {
      const key = keyFn(item);
      return [key, valueFn(item, key)] as [K, V];
    });
    return new Wap(entries);
  }

  /**
   * Creates a new Wap instance.
   * @param entries The initial entries of the map.
   */
  constructor(entries: IterableIterator<[K, V]> | [K, V][] | null = null) {
    this.rawMap = new Map(entries);
  }

  /**
   * Sets a key-value pair in the map.
   * @param key The key of the pair.
   * @param value The value of the pair.
   * @returns The updated Wap instance.
   */
  set(key: K, value: V): this {
    this.rawMap.set(key, value);
    return this;
  }

  /**
   * Gets the value associated with a key in the map.
   * @param key The key to retrieve the value for.
   * @returns The value associated with the key, or undefined if the key is not found.
   */
  get(key: K): V | undefined {
    return this.rawMap.get(key);
  }

  /**
   * Gets the value associated with a key in the map, or throws an error if the key is not found.
   * @param key The key to retrieve the value for.
   * @returns The value associated with the key.
   * @throws Error if the key is not found in the map.
   */
  getEnsure(key: K): V {
    const result = this.rawMap.get(key);

    if (result === undefined) {
      throw new Error(`Key [${key}] not found in map`);
    }

    return result;
  }

  /**
   * Gets the value associated with a key in the map, or sets a default value if the key is not found.
   * @param key The key to retrieve the value for.
   * @param value The default value to set if the key is not found.
   * @returns The value associated with the key, or the default value if the key is not found.
   */
  getElseSet(key: K, value: V): V;
  /**
   * Gets the value associated with a key in the map, or sets a value computed by a factory function if the key is not found.
   * @param key The key to retrieve the value for.
   * @param valueFactory The factory function to compute the value if the key is not found.
   * @returns The value associated with the key, or the value computed by the factory function if the key is not found.
   */
  getElseSet(key: K, valueFactory: () => V): V;
  getElseSet(key: K, valueOrValueFactory: V | (() => V)): V {
    if (!this.has(key)) {
      if (typeof valueOrValueFactory === 'function') {
        this.set(key, (valueOrValueFactory as () => V)());
      } else {
        this.set(key, valueOrValueFactory);
      }
    }

    return this.getEnsure(key);
  }

  /**
   * Checks if a key exists in the map.
   * @param key The key to check.
   * @returns True if the key exists in the map, false otherwise.
   */
  has(key: K): boolean {
    return this.rawMap.has(key);
  }

  /**
   * Deletes a key-value pair from the map.
   * @param key The key of the pair to delete.
   * @returns True if the pair was deleted, false if the key was not found.
   */
  delete(key: K): boolean {
    return this.rawMap.delete(key);
  }

  /**
   * Clears all key-value pairs from the map.
   */
  clear(): void {
    this.rawMap.clear();
  }

  /**
   * Gets the number of key-value pairs in the map.
   */
  get size(): number {
    return this.rawMap.size;
  }

  /**
   * Checks if the map is empty.
   */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Gets an array of all keys in the map.
   * @returns An array of keys.
   */
  keys(): K[] {
    return Array.from(this.rawMap.keys());
  }

  /**
   * Gets an array of all values in the map.
   * @returns An array of values.
   */
  values(): V[] {
    return Array.from(this.rawMap.values());
  }

  /**
   * Gets an array of all key-value pairs in the map.
   * @returns An array of key-value pairs.
   */
  entries(): [K, V][] {
    return Array.from(this.rawMap.entries());
  }

  /**
   * Creates a new Wap instance by applying a mapping function to each value in the map.
   * @param f The mapping function.
   * @returns A new Wap instance with the mapped values.
   */
  mapValue<NV>(f: (value: V, key: K) => NV): Wap<K, NV> {
    const newMap = new Wap<K, NV>();

    this.forEach((value, key) => {
      newMap.set(key, f(value, key));
    });

    return newMap;
  }

  /**
   * Creates a new Wap instance by applying a mapping function to each key in the map.
   * @param f The mapping function.
   * @returns A new Wap instance with the mapped keys.
   */
  mapKey<NK>(f: (key: K, value: V) => NK): Wap<NK, V> {
    const newMap = new Wap<NK, V>();

    this.forEach((value, key) => {
      newMap.set(f(key, value), value);
    });

    return newMap;
  }

  /**
   * Creates a new Wap instance by applying a mapping function to each key-value pair in the map.
   * @param f The mapping function.
   * @returns A new Wap instance with the mapped key-value pairs.
   */
  mapKeyAndValue<NK, NV>(f: (key: K, value: V) => [NK, NV]): Wap<NK, NV> {
    const newMap = new Wap<NK, NV>();

    this.forEach((value, key) => {
      const [newKey, newValue] = f(key, value);
      newMap.set(newKey, newValue);
    });

    return newMap;
  }

  /**
   * Executes a provided function once for each key-value pair in the map.
   * @param callbackfn The function to execute for each key-value pair.
   * @param thisArg The value to use as `this` when executing the callback function.
   */
  forEach(
    callbackfn: (value: V, key: K, map: Wap<K, V>) => void,
    thisArg?: unknown,
  ): void {
    this.rawMap.forEach((value, key) => callbackfn.call(thisArg, value, key, this));
  }

  /**
   * Merges another Wap instance into this map.
   * @param other The other Wap instance to merge.
   * @returns The updated Wap instance.
   */
  merge(other: Wap<K, V>): this {
    other.forEach((value, key) => {
      this.set(key, value);
    });
    return this;
  }

  /**
   * Creates a new Wap instance by filtering the key-value pairs in the map based on a predicate function.
   * @param predicate The predicate function to filter the key-value pairs.
   * @returns A new Wap instance with the filtered key-value pairs.
   */
  filter(predicate: (value: V, key: K) => boolean): Wap<K, V> {
    const newMap = new Wap<K, V>();
    this.forEach((value, key) => {
      if (predicate(value, key)) {
        newMap.set(key, value);
      }
    });
    return newMap;
  }

  /**
   * Reduces the key-value pairs in the map to a single value.
   * @param reducer The reducer function to apply to each key-value pair.
   * @param initialValue The initial value for the reducer.
   * @returns The reduced value.
   */
  reduce<T>(reducer: (accumulator: T, value: V, key: K) => T, initialValue: T): T {
    let accumulator = initialValue;
    this.forEach((value, key) => {
      accumulator = reducer(accumulator, value, key);
    });
    return accumulator;
  }

  /**
   * Converts the map to a record object.
   * @returns The record object.
   * @throws Error if any key in the map is not a valid Record key type.
   */
  toRecord(): Record<string | number | symbol, V> {
    const record = {} as Record<string | number | symbol, V>;
    this.rawMap.forEach((value, key) => {
      if (typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'symbol') {
        throw new Error(`Key [${key}] is not a valid Record key type`);
      }
      record[key as string | number | symbol] = value;
    });
    return record;
  }

  /**
   * Creates a shallow clone of the map.
   * @returns A new Wap instance with the same key-value pairs.
   */
  clone(): Wap<K, V> {
    return new Wap(this.entries());
  }

  /**
   * Returns an iterator over the key-value pairs in the map.
   * @returns An iterator over the key-value pairs.
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()[Symbol.iterator]();
  }
}
