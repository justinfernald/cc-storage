import { observer } from 'mobx-react-lite';

import { ItemStack, StorageSystem } from '../interfaces/types';
import { useMemo } from 'react';
import { FilterInfo } from '../interfaces/item-filter-types';
import { ReducedItemStack } from '../interfaces/extra-types';
import { flexColumn } from '../styles';
import { ListViewItem } from './ListViewItem';

export interface SystemListViewProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

export const SystemListView = observer((props: SystemListViewProps) => {
  const { system } = props;

  const reducedItems = useMemo(() => {
    const itemStacksWithStorageMap = new Map<
      string,
      { storageName: string; itemStack: ItemStack }[]
    >();

    for (const storage of system.storages) {
      if (!storage.itemStacks || !Array.isArray(storage.itemStacks)) {
        continue;
      }

      for (const itemStack of storage.itemStacks) {
        if (!itemStacksWithStorageMap.has(itemStack.name)) {
          itemStacksWithStorageMap.set(itemStack.name, []);
        }

        itemStacksWithStorageMap.get(itemStack.name)?.push({
          storageName: storage.name,
          itemStack,
        });
      }
    }

    const reducedItemsMap = new Map<string, Map<string, ReducedItemStack>>();

    for (const [name, itemStacksWithStorage] of itemStacksWithStorageMap) {
      console.log({ name, itemStacks: itemStacksWithStorage });
      // group them by nbtHash
      const reducedItems = new Map<string, ReducedItemStack>();
      for (const itemStackWithStorage of itemStacksWithStorage) {
        if (!reducedItems.has(itemStackWithStorage.itemStack.nbtHash)) {
          reducedItems.set(itemStackWithStorage.itemStack.nbtHash, {
            ...itemStackWithStorage.itemStack,
            reducedItemStackStorageInfo: [
              {
                storageName: itemStackWithStorage.storageName,
                slot: itemStackWithStorage.itemStack.slot,
                count: itemStackWithStorage.itemStack.count,
              },
            ],
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          reducedItems.get(itemStackWithStorage.itemStack.nbtHash)!.count +=
            itemStackWithStorage.itemStack.count;

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          reducedItems
            .get(itemStackWithStorage.itemStack.nbtHash)!
            .reducedItemStackStorageInfo.push({
              storageName: itemStackWithStorage.storageName,
              slot: itemStackWithStorage.itemStack.slot,
              count: itemStackWithStorage.itemStack.count,
            });
        }
      }
      reducedItemsMap.set(name, reducedItems);
    }

    return Array.from(reducedItemsMap.values());
  }, [system]);

  return (
    <div css={[flexColumn, { gap: 5 }]}>
      {reducedItems.map((reducedItemStack) =>
        Array.from(reducedItemStack.values()).map((itemStack) => (
          <ListViewItem
            key={itemStack.name}
            storageSystem={system}
            reducedItemStack={itemStack}
          />
        )),
      )}
    </div>
  );
});
