import { ItemStack } from './types';

export interface ReducedItemStackStorageInfo {
  storageName: string;
  slot: number;
  count: number;
}

export interface ReducedItemStack extends Omit<ItemStack, 'slot'> {
  reducedItemStackStorageInfo: ReducedItemStackStorageInfo[];
}
