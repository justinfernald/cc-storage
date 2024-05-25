import { makeAutoObservable } from 'mobx';
import { Wap } from './Wap';

export class WapBucket<K, V> {
  rawMap: Map<K, V[]>;

  static fromWapBucketValues<K, V>(entries: [K, V[]][]): WapBucket<K, V> {
    return new WapBucket(entries);
  }

  static groupBy<T, K extends string | number | symbol>(
    array: T[],
    keyFn: (item: T) => K,
  ): WapBucket<K, T> {
    const map = new Map<K, T[]>();
    for (const item of array) {
      const key = keyFn(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return new WapBucket(Array.from(map.entries()));
  }

  static groupByMapped<T, K extends string | number | symbol, V>(
    array: T[],
    keyFn: (item: T) => K,
    valueFn: (item: T, key: K) => V,
  ): WapBucket<K, V> {
    const map = new Map<K, V[]>();
    for (const item of array) {
      const key = keyFn(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(valueFn(item, key));
    }
    return new WapBucket(map.entries());
  }

  constructor(entries: IterableIterator<[K, V[]]> | [K, V[]][] | null = null) {
    this.rawMap = new Map(entries);

    makeAutoObservable(this, {}, { autoBind: true });
  }

  set(key: K, values: V[]): this {
    this.rawMap.set(key, values);
    return this;
  }

  addValue(key: K, value: V): this {
    if (!this.rawMap.has(key)) {
      this.rawMap.set(key, []);
    }
    this.rawMap.get(key)!.push(value);
    return this;
  }

  get(key: K): V[] {
    return this.rawMap.get(key) ?? [];
  }

  getElseSet(key: K, values: V[]): V[];
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

  has(key: K): boolean {
    return this.rawMap.has(key);
  }

  hasValue(key: K, value: V): boolean {
    const bucket = this.rawMap.get(key);
    return bucket ? bucket.includes(value) : false;
  }

  delete(key: K): boolean {
    return this.rawMap.delete(key);
  }

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

  clear(): void {
    this.rawMap.clear();
  }

  get size(): number {
    return this.rawMap.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  keys<R = K[]>(mapfn?: (v: K, i: number) => R): R[] {
    return Array.from(this.rawMap.keys(), mapfn as any);
  }

  values<R = V[]>(mapfn?: (v: V[], i: number) => R): R[] {
    return Array.from(this.rawMap.values(), mapfn as any);
  }

  entries<R = [K, V[]]>(mapfn?: (v: [K, V[]], i: number) => R): R[] {
    return Array.from(this.rawMap.entries(), mapfn as any);
  }

  mapValues<NV>(f: (values: V[], key: K) => NV[]): WapBucket<K, NV> {
    const newMap = new WapBucket<K, NV>();

    for (const [key, values] of this.rawMap.entries()) {
      newMap.set(key, f(values, key));
    }

    return newMap;
  }

  mapValuesToWap<NV>(f: (values: V[], key: K) => NV): Wap<K, NV> {
    const newMap = new Wap<K, NV>();

    for (const [key, values] of this.rawMap.entries()) {
      newMap.set(key, f(values, key));
    }

    return newMap;
  }

  mapKeys<NK>(f: (key: K, values: V[]) => NK): WapBucket<NK, V> {
    const newMap = new WapBucket<NK, V>();

    for (const [key, values] of this.rawMap.entries()) {
      newMap.set(f(key, values), values);
    }

    return newMap;
  }

  mapKeysAndValues<NK, NV>(f: (key: K, values: V[]) => [NK, NV[]]): WapBucket<NK, NV> {
    const newMap = new WapBucket<NK, NV>();

    for (const [key, values] of this.rawMap.entries()) {
      const [newKey, newValues] = f(key, values);
      newMap.set(newKey, newValues);
    }

    return newMap;
  }

  forEach(
    callbackfn: (values: V[], key: K, map: WapBucket<K, V>) => void,
    thisArg?: unknown,
  ): void {
    for (const [key, values] of this.rawMap.entries()) {
      callbackfn.call(thisArg, values, key, this);
    }
  }

  merge(other: WapBucket<K, V>): this {
    for (const [key, values] of other.rawMap.entries()) {
      if (this.rawMap.has(key)) {
        this.rawMap.get(key)!.push(...values);
      } else {
        this.set(key, values);
      }
    }
    return this;
  }

  filter(predicate: (values: V[], key: K) => boolean): WapBucket<K, V> {
    const newMap = new WapBucket<K, V>();
    for (const [key, values] of this.rawMap.entries()) {
      if (predicate(values, key)) {
        newMap.set(key, values);
      }
    }
    return newMap;
  }

  reduce<T>(reducer: (accumulator: T, values: V[], key: K) => T, initialValue: T): T {
    let accumulator = initialValue;
    for (const [key, values] of this.rawMap.entries()) {
      accumulator = reducer(accumulator, values, key);
    }
    return accumulator;
  }

  clone(): WapBucket<K, V> {
    return WapBucket.fromWapBucketValues(this.entries());
  }

  toRecord(): Record<string | number | symbol, V[]> {
    const record = {} as Record<string | number | symbol, V[]>;
    for (const [key, values] of this.rawMap.entries()) {
      if (typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'symbol') {
        throw new Error(`Key [${key}] is not a valid Record key type`);
      }
      record[key as string | number | symbol] = values;
    }
    return record;
  }

  [Symbol.iterator](): IterableIterator<[K, V[]]> {
    return this.rawMap.entries();
  }
}
