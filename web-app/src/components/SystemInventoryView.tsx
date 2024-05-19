import { observer } from 'mobx-react-lite';

import { ItemStack, StorageInfo, StorageSystem } from '../interfaces/types';
import { FilterInfo } from '../interfaces/item-filter-types';
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';
import { ReducedItemStack } from '../interfaces/extra-types';
import { InventoryViewItem } from './InventoryViewItem';
import { flexColumn, padding } from '../styles';

interface SystemInventoryViewModelProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

export interface ReducedStorageInfo extends Omit<StorageInfo, 'itemStacks'> {
  reducedItemStacks: ReducedItemStack[];
}

class SystemInventoryViewModel extends BaseViewModel<SystemInventoryViewModelProps> {
  constructor(props: SystemInventoryViewModelProps) {
    super(props);
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }

  get reducedStorage() {
    const storageMap = new Map<string, ReducedStorageInfo>();

    // take item stacks in storage then sum up the count for matching name and nbtHash

    for (const storage of this.props.system.storages) {
      if (!storage.itemStacks) {
        continue;
      }

      const reducedItemStacks = new Map<string, ReducedItemStack>();

      for (const itemStack of storage.itemStacks) {
        const reducedItemStack = reducedItemStacks.get(itemStack.name);

        if (!reducedItemStack) {
          reducedItemStacks.set(itemStack.name, {
            ...itemStack,
            storageSlotInfo: [
              {
                storageName: storage.name,
                slot: itemStack.slot,
                count: itemStack.count,
              },
            ],
          });
        } else {
          reducedItemStack.count += itemStack.count;
          reducedItemStack.storageSlotInfo.push({
            storageName: storage.name,
            slot: itemStack.slot,
            count: itemStack.count,
          });
        }
      }

      storageMap.set(storage.name, {
        ...storage,
        reducedItemStacks: Array.from(reducedItemStacks.values()),
      });
    }

    return storageMap;
  }

  get reducedStorageList() {
    return Array.from(this.reducedStorage.values());
  }

  get reducedItems() {
    const itemStacksWithStorageMap = new Map<
      string,
      { storageName: string; itemStack: ItemStack }[]
    >();

    for (const storage of this.props.system.storages) {
      if (!storage.itemStacks) {
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
      // group them by nbtHash
      const reducedItems = new Map<string, ReducedItemStack>();
      for (const itemStackWithStorage of itemStacksWithStorage) {
        if (!reducedItems.has(itemStackWithStorage.itemStack.nbtHash)) {
          reducedItems.set(itemStackWithStorage.itemStack.nbtHash, {
            ...itemStackWithStorage.itemStack,
            storageSlotInfo: [
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
          reducedItems.get(itemStackWithStorage.itemStack.nbtHash)!.storageSlotInfo.push({
            storageName: itemStackWithStorage.storageName,
            slot: itemStackWithStorage.itemStack.slot,
            count: itemStackWithStorage.itemStack.count,
          });
        }
      }
      reducedItemsMap.set(name, reducedItems);
    }

    return Array.from(reducedItemsMap.values());
  }
}

export interface SystemInventoryViewProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

export const SystemInventoryView = observer((props: SystemInventoryViewProps) => {
  const { system, filterInfo } = props;

  const viewModel = useViewModelConstructor(SystemInventoryViewModel, {
    system,
    filterInfo,
  });

  return (
    <div css={[flexColumn, { gap: 5 }, padding('md')]}>
      {viewModel.reducedStorageList.map((storage) => (
        <InventoryViewItem
          key={storage.name}
          storageSystem={system}
          reducedStorageInfo={storage}
        />
      ))}
    </div>
  );
});
