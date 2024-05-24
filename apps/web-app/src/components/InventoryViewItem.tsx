import { observer } from 'mobx-react-lite';

import { flex1, flexBetween, flexCenterVertical, flexValue } from '../styles';
import { StorageSystem } from 'types';
import { useState } from 'react';
import { Button, Collapse } from '@blueprintjs/core';
import { InventoryDialog } from './dialogs/InventoryDialog';
import { ReducedStorageInfo } from './SystemInventoryView';
import { FlexColumn, FlexRow } from './base/Flex';
import { FilterInfo } from '../interfaces/item-filter-types';
import { ListViewItem } from './ListViewItem';

// interface StorageItemListViewModelProps {
//   storageSystem: StorageSystem;
//   reducedStorageInfo: ReducedStorageInfo;
//   filterInfo: FilterInfo;
// }

// class StorageItemListViewModel extends BaseViewModel<StorageItemListViewModelProps> {
//   constructor(props: StorageItemListViewModelProps) {
//     super(props);
//     makeSimpleAutoObservable(this, {}, { autoBind: true });
//   }

//   get reducedItems() {
//     const itemStacksWithStorageMap = new Map<
//       string,
//       { storageName: string; itemStack: ItemStack }[]
//     >();

//     for (const itemStack of this.props.reducedStorageInfo.reducedItemStacks) {
//       if (!storage.itemStacks) {
//         continue;
//       }

//       for (const itemStack of storage.itemStacks) {
//         if (!itemStacksWithStorageMap.has(itemStack.name)) {
//           itemStacksWithStorageMap.set(itemStack.name, []);
//         }

//         itemStacksWithStorageMap.get(itemStack.name)?.push({
//           storageName: storage.name,
//           itemStack,
//         });
//       }
//     }

//     const reducedItemsMap = new Map<string, Map<string, ReducedItemStack>>();

//     for (const [name, itemStacksWithStorage] of itemStacksWithStorageMap) {
//       // group them by nbtHash
//       const reducedItems = new Map<string, ReducedItemStack>();
//       for (const itemStackWithStorage of itemStacksWithStorage) {
//         if (!reducedItems.has(itemStackWithStorage.itemStack.nbtHash)) {
//           reducedItems.set(itemStackWithStorage.itemStack.nbtHash, {
//             ...itemStackWithStorage.itemStack,
//             storageSlotInfo: [
//               {
//                 storageName: itemStackWithStorage.storageName,
//                 slot: itemStackWithStorage.itemStack.slot,
//                 count: itemStackWithStorage.itemStack.count,
//               },
//             ],
//           });
//         } else {
//           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//           reducedItems.get(itemStackWithStorage.itemStack.nbtHash)!.count +=
//             itemStackWithStorage.itemStack.count;

//           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//           reducedItems.get(itemStackWithStorage.itemStack.nbtHash)!.storageSlotInfo.push({
//             storageName: itemStackWithStorage.storageName,
//             slot: itemStackWithStorage.itemStack.slot,
//             count: itemStackWithStorage.itemStack.count,
//           });
//         }
//       }
//       reducedItemsMap.set(name, reducedItems);
//     }

//     return Array.from(reducedItemsMap.values());
//   }
// }

export interface InventoryViewItemProps {
  storageSystem: StorageSystem;
  reducedStorageInfo: ReducedStorageInfo;
  filterInfo: FilterInfo;
}

export const InventoryViewItem = observer((props: InventoryViewItemProps) => {
  const { reducedStorageInfo, storageSystem, filterInfo } = props;

  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  const [isItemListOpen, setIsItemListOpen] = useState(false);

  // const viewModel = useViewModelConstructor(StorageItemListViewModel, props);

  const openInventoryDialog = () => {
    setIsInventoryDialogOpen(true);
  };

  const closeInventoryDialog = () => {
    setIsInventoryDialogOpen(false);
  };

  const toggleItemList = () => {
    setIsItemListOpen(!isItemListOpen);
  };

  return (
    <>
      <FlexRow gap={5}>
        <Button
          icon={isItemListOpen ? 'chevron-up' : 'chevron-down'}
          minimal
          onClick={toggleItemList}
        />
        <Button minimal css={[{ display: 'block' }, flex1]} onClick={openInventoryDialog}>
          <div css={[flexBetween, flexCenterVertical, { gap: 10 }]}>
            {/* <div css={[{ width: 50, height: 50 }]}>
              <img
                css={[fullSize, { objectFit: 'cover' }]}
                alt="Missing Texture"
                src="https://cravatar.eu/helmhead/AJap/100.png"
              />
            </div> */}
            <div css={[flexValue(1)]}>
              <div css={[flexBetween, flexCenterVertical]}>
                <h3>{reducedStorageInfo.name}</h3>
                <h3>{reducedStorageInfo.reducedItemStacks.length}</h3>
              </div>
              <div>
                <i>{reducedStorageInfo.name}</i>
              </div>
            </div>
          </div>
        </Button>
      </FlexRow>
      <Collapse isOpen={isItemListOpen}>
        <div
          css={[
            {
              position: 'absolute',
              top: 10,
              bottom: 10,
              left: 15 - 1,
            },
            { width: 2, backgroundColor: '#999', borderRadius: 1 },
          ]}
        ></div>
        <FlexColumn gap={5} css={[{ paddingLeft: 35 }]}>
          {reducedStorageInfo.reducedItemStacks.map((itemStack) => (
            <ListViewItem
              key={itemStack.nbtHash}
              storageSystem={storageSystem}
              reducedItemStack={itemStack}
            />
          ))}
        </FlexColumn>
      </Collapse>
      <InventoryDialog
        storageSystem={storageSystem}
        isOpen={isInventoryDialogOpen}
        onClose={closeInventoryDialog}
        reducedStorageInfo={reducedStorageInfo}
      />
    </>
  );
});
