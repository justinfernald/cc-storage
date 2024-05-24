import { ItemStack } from 'types';

export interface StorageSlotInfo {
  storageName: string;
  slot: number;
  count: number;
}

export interface ReducedItemStack extends Omit<ItemStack, 'slot'> {
  storageSlotInfo: StorageSlotInfo[];
}
