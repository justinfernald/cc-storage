export enum MessageTypeComputerToServer {
  STORAGE_SYSTEM_UPDATE = 'STORAGE_SYSTEM_UPDATE',
}

export enum MessageTypeServerToComputer {
  FETCH_UPDATE = 'FETCH_UPDATE',
  MOVE_ITEMS = 'MOVE_ITEMS',
  INFO = 'INFO',
}

/** Represents a whole storage system */
export interface StorageSystem {
  name: string;
  storages: StorageInfo[];
}

/** Represents all data in a single storage inventory (chest / drawer network / item vault) */

export interface StorageInfo {
  name: string;
  metaData: StorageMetaData;

  itemStacks: ItemStack[] | null;
}

/** Extra data about storage */
export interface StorageMetaData {
  size: number;
}

/** Item stack representing items in a single slot of a storage inventory */
export interface ItemStack {
  slot: number;

  name: string;
  count: number;
  nbtHash: string;

  itemDetails: ItemDetails | null;
}

/** Extra details for item */
export interface ItemDetails {
  displayName: string;
  lore: string[] | null;
  durability: number | null;
  maxCount: number;
  maxDamage: number | null;
  enchantments: Enchantment[] | null;
  tags: string[];
}

/** Enchantment on item */
export interface Enchantment {
  displayName: string;
  level: number;
  name: string;
}

/** Represents a storage system update */
export interface StorageSystemUpdate {
  storageSystem: StorageSystem;
  updateTime: number;
}

/** Represents a single item move operation */
export interface ItemMove {
  /** storage name */
  from: string;
  /** storage name */
  to: string;

  fromSlot: number;
  toSlot: number | null;

  quantity: number | null;
}

/** Represents multiple item move operations */
export interface ItemMoves {
  moves: ItemMove[];
}

export interface MessageC2SStructure {
  type: MessageTypeComputerToServer;
  data: unknown;
}

export interface MessageS2CStructure {
  type: MessageTypeServerToComputer;
  data: unknown;
}

export interface MessageC2SInventoryUpdate extends MessageC2SStructure {
  type: MessageTypeComputerToServer.STORAGE_SYSTEM_UPDATE;
  data: StorageSystemUpdate;
}

export interface MessageS2CFetchUpdate extends MessageS2CStructure {
  type: MessageTypeServerToComputer.FETCH_UPDATE;
  data: null;
}

export interface MessageS2CInfo extends MessageS2CStructure {
  type: MessageTypeServerToComputer.INFO;
  code: number;
  data: string;
}

export interface MessageS2CMoveItems extends MessageS2CStructure {
  type: MessageTypeServerToComputer.MOVE_ITEMS;
  data: ItemMoves;
}

export type MessageC2S = MessageC2SInventoryUpdate;
export type MessageS2C = MessageS2CFetchUpdate | MessageS2CInfo | MessageS2CMoveItems;
