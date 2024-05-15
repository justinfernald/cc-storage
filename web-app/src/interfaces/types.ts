export enum MessageTypeComputerToServer {
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
}

export enum MessageTypeServerToComputer {
  FETCH_UPDATE = 'FETCH_UPDATE',
  MOVE_ITEMS = 'MOVE_ITEMS',
  INFO = 'INFO',
}

export interface StorageInfo {
  name: string;
  metaData: StorageMetaData;

  itemStacks: ItemStack[];
}

export interface StorageMetaData {
  size: number;
}

export interface ItemStack {
  slot: number;

  name: string;
  count: number;
  nbtHash: string;

  itemDetails: ItemDetails | null;
}

export interface ItemDetails {
  displayName: string;
  lore: string[] | null;
  durability: number | null;
  maxCount: number;
  maxDamage: number | null;
  enchantments: Enchantment[] | null;
  tags: string[];
}

export interface Enchantment {
  displayName: string;
  level: number;
  name: string;
}

export interface InventoryUpdate {
  storages: StorageInfo[];
}

export interface ItemMove {
  /** storage name */
  from: string;
  /** storage name */
  to: string;

  fromSlot: number;
  toSlot: number | null;

  quantity: number | null;
}

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
  type: MessageTypeComputerToServer.INVENTORY_UPDATE;
  data: InventoryUpdate;
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
