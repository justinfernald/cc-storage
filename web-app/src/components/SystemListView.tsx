import { observer } from 'mobx-react-lite';

import { ItemStack, StorageSystem } from '../interfaces/types';
import { useMemo } from 'react';
import { FilterInfo, SearchTag, SortDirection } from '../interfaces/item-filter-types';
import { ReducedItemStack } from '../interfaces/extra-types';
import { flexColumn, padding } from '../styles';
import { ListViewItem } from './ListViewItem';
import { BaseViewModel } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';

interface SystemListViewModelProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

class SystemListViewModel extends BaseViewModel<SystemListViewModelProps> {
  constructor(props: SystemListViewModelProps) {
    super(props);
    makeSimpleAutoObservable(this, {}, { autoBind: true });
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

export interface SystemListViewProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

export const SystemListView = observer((props: SystemListViewProps) => {
  const { system, filterInfo } = props;

  const viewModel = useMemo(
    () => new SystemListViewModel({ system, filterInfo }),
    [system, filterInfo],
  );

  const reducedItems = viewModel.reducedItems;

  return (
    <div css={[flexColumn, { gap: 5 }, padding('md')]}>
      {reducedItems
        .flatMap((reducedItemStack) =>
          filterReducedItemStackCollection(
            Array.from(reducedItemStack.values()),
            filterInfo,
          ),
        )
        .toSorted(
          (itemStackA, itemStackB) =>
            itemStackA.itemDetails.displayName.localeCompare(
              itemStackB.itemDetails.displayName,
            ) * (filterInfo.sortDirection === SortDirection.ASC ? 1 : -1),
        )
        .map((itemStack) => (
          <ListViewItem
            key={`${itemStack.name}:${itemStack.nbtHash}`}
            storageSystem={system}
            reducedItemStack={itemStack}
          />
        ))}
    </div>
  );
});

export function valueMatchesSearch(
  value: string,
  searchText: string,
  regexMode: boolean,
): boolean {
  if (regexMode) {
    try {
      return new RegExp(searchText).test(value);
    } catch (e) {
      return false;
    }
  }

  return value.toLowerCase().includes(searchText.toLowerCase());
}

export function filterReducedItemStack(
  reducedItemStack: ReducedItemStack,
  filterInfo: FilterInfo,
): boolean {
  const searchText = filterInfo.search;
  const regexMode = filterInfo.regexMode;

  for (const searchTag of filterInfo.searchTags) {
    switch (searchTag) {
      case SearchTag.DISPLAY_NAME:
        if (
          valueMatchesSearch(
            reducedItemStack.itemDetails.displayName,
            searchText,
            regexMode,
          )
        ) {
          return true;
        }
        break;
      case SearchTag.ENCHANTMENTS:
        if (reducedItemStack.itemDetails.enchantments === null) {
          break;
        }

        if (
          reducedItemStack.itemDetails.enchantments.some((enchantment) =>
            [enchantment.displayName, /* enchantment.name,*/ enchantment.level]
              .map(String)
              .some((value) => valueMatchesSearch(value, searchText, regexMode)),
          )
        ) {
          return true;
        }
        break;
      case SearchTag.LORE:
        if (reducedItemStack.itemDetails.lore === null) {
          break;
        }

        if (
          reducedItemStack.itemDetails.lore.some((loreText) =>
            valueMatchesSearch(loreText, searchText, regexMode),
          )
        ) {
          return true;
        }
        break;
      case SearchTag.NAME:
        if (valueMatchesSearch(reducedItemStack.name, searchText, regexMode)) {
          return true;
        }
        break;
      case SearchTag.TAGS:
        if (
          Object.entries(reducedItemStack.itemDetails.tags).some(
            ([tag, value]) => value && valueMatchesSearch(tag, searchText, regexMode),
          )
        ) {
          return true;
        }
        break;
    }
  }

  return false;
}

export function filterReducedItemStackCollection(
  reducedItemStacks: ReducedItemStack[],
  filterInfo: FilterInfo,
): ReducedItemStack[] {
  return reducedItemStacks.filter((reducedItemStack) =>
    filterReducedItemStack(reducedItemStack, filterInfo),
  );
}
