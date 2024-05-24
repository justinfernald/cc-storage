import { observer } from 'mobx-react-lite';

import { ItemStack, StorageInfo, StorageSystem } from 'types';
import { FilterInfo } from '../interfaces/item-filter-types';
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';
import { ReducedItemStack, StorageSlotInfo } from '../interfaces/extra-types';
import { InventoryViewItem } from './InventoryViewItem';
import { flexColumn, padding } from '../styles';
import { toJS } from 'mobx';
import { Wap, WapBucket } from 'utils';

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

  get reducedStorageList() {
    const storageMap = this.props.system.storages.map((storage) => {
      const reducedItemStacksMap = Wap.fromReduce<ItemStack, string, ReducedItemStack>(
        storage.itemStacks,
        (itemStack) => `${itemStack.name}${itemStack.nbtHash}`,
        (acc, itemStack) => ({
          ...acc,
          count: acc.count + itemStack.count,
          storageSlotInfo: [
            ...acc.storageSlotInfo,
            {
              storageName: storage.name,
              slot: itemStack.slot,
              count: itemStack.count,
            },
          ],
        }),
        (itemStack) => ({
          name: itemStack.name,
          itemDetails: itemStack.itemDetails,
          nbtHash: itemStack.nbtHash,
          count: 0,
          storageSlotInfo: [],
        }),
      );

      return {
        ...storage,
        reducedItemStacks: reducedItemStacksMap.values(),
      };
    });

    console.log(toJS(storageMap));

    return storageMap;
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
          filterInfo={filterInfo}
        />
      ))}
    </div>
  );
});
