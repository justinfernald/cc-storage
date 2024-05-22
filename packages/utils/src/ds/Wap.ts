export class Wap<K, V> {
  rawMap: Map<K, V>;

  static fromRecord<K extends string | number | symbol, V>(
    record: Record<K, V>,
  ): Wap<K, V> {
    const entries = Object.entries(record) as [K, V][];
    return new Wap(entries);
  }

  static fromArray<K, V>(array: V[], keyFn: (item: V) => K): Wap<K, V> {
    const entries = array.map((item) => [keyFn(item), item] as [K, V]);
    return new Wap(entries);
  }

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

  constructor(entries: IterableIterator<[K, V]> | [K, V][] | null = null) {
    this.rawMap = new Map(entries);
  }

  set(key: K, value: V): this {
    this.rawMap.set(key, value);
    return this;
  }

  get(key: K): V | undefined {
    return this.rawMap.get(key);
  }

  getEnsure(key: K): V {
    const result = this.rawMap.get(key);

    if (result === undefined) {
      throw new Error(`Key [${key}] not found in map`);
    }

    return result;
  }

  getElseSet(key: K, value: V): V;
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

  has(key: K): boolean {
    return this.rawMap.has(key);
  }

  delete(key: K): boolean {
    return this.rawMap.delete(key);
  }

  clear(): void {
    this.rawMap.clear();
  }

  get size(): number {
    return this.rawMap.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  keys(): K[] {
    return Array.from(this.rawMap.keys());
  }

  values(): V[] {
    return Array.from(this.rawMap.values());
  }

  entries(): [K, V][] {
    return Array.from(this.rawMap.entries());
  }

  mapValue<NV>(f: (value: V, key: K) => NV): Wap<K, NV> {
    const newMap = new Wap<K, NV>();

    this.forEach((value, key) => {
      newMap.set(key, f(value, key));
    });

    return newMap;
  }

  mapKey<NK>(f: (key: K, value: V) => NK): Wap<NK, V> {
    const newMap = new Wap<NK, V>();

    this.forEach((value, key) => {
      newMap.set(f(key, value), value);
    });

    return newMap;
  }

  mapKeyAndValue<NK, NV>(f: (key: K, value: V) => [NK, NV]): Wap<NK, NV> {
    const newMap = new Wap<NK, NV>();

    this.forEach((value, key) => {
      const [newKey, newValue] = f(key, value);
      newMap.set(newKey, newValue);
    });

    return newMap;
  }

  forEach(
    callbackfn: (value: V, key: K, map: Wap<K, V>) => void,
    thisArg?: unknown,
  ): void {
    this.rawMap.forEach((value, key) => callbackfn.call(thisArg, value, key, this));
  }

  merge(other: Wap<K, V>): this {
    other.forEach((value, key) => {
      this.set(key, value);
    });
    return this;
  }

  filter(predicate: (value: V, key: K) => boolean): Wap<K, V> {
    const newMap = new Wap<K, V>();
    this.forEach((value, key) => {
      if (predicate(value, key)) {
        newMap.set(key, value);
      }
    });
    return newMap;
  }

  reduce<T>(reducer: (accumulator: T, value: V, key: K) => T, initialValue: T): T {
    let accumulator = initialValue;
    this.forEach((value, key) => {
      accumulator = reducer(accumulator, value, key);
    });
    return accumulator;
  }

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

  clone(): Wap<K, V> {
    return new Wap(this.entries());
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()[Symbol.iterator]();
  }
}
