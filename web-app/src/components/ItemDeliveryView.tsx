import { observer } from 'mobx-react-lite';

import { flexBetween, flexColumn, flexValue } from '../styles';
import { StorageInfo, StorageSystem } from '../interfaces/types';
import { useState } from 'react';
import { Button, MenuItem, NumericInput } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import { ReducedItemStack } from '../interfaces/extra-types';

export interface ItemDeliveryViewProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
}

export const ItemDeliveryView = observer((props: ItemDeliveryViewProps) => {
  const { storageSystem, reducedItemStack } = props;

  const [quantity, setQuantity] = useState(1);
  const [selectedStorage, setSelectedStorage] = useState<StorageInfo | undefined>();

  if (!reducedItemStack.itemDetails) {
    return null;
  }

  const itemCount = reducedItemStack.count;
  const itemCountInSelectedStorage = selectedStorage
    ? reducedItemStack.reducedItemStackStorageInfo
        .filter((s) => s.storageName === selectedStorage.name)
        .reduce((acc, s) => acc + s.count, 0)
    : null;
  const itemCountInOtherStorages =
    itemCountInSelectedStorage !== null ? itemCount - itemCountInSelectedStorage : null;

  console.log({
    itemCount,
    itemCountInSelectedStorage,
    itemCountInOtherStorages,
  });

  return (
    <div css={[flexColumn, { gap: 5 }]}>
      <div css={[flexColumn, { gap: 5 }]}>
        <div css={[flexColumn, { gap: 5, width: 270, alignSelf: 'center' }]}>
          <div>
            Inventory
            <Select<StorageInfo>
              items={storageSystem.storages}
              itemPredicate={filterInventoryLocationListItem}
              itemRenderer={renderInventoryLocationListItem}
              noResults={
                <MenuItem disabled={true} text="No results." roleStructure="listoption" />
              }
              onItemSelect={setSelectedStorage}
            >
              <Button
                fill
                text={selectedStorage?.name ?? 'Select Inventory Location'}
                rightIcon="double-caret-vertical"
              />
            </Select>
          </div>
          <div>
            Quantity
            {/* <Slider
              value={quantity}
              onChange={(value) => setQuantity(Math.max(1, value))}
              min={0}
              max={reducedItemStack.count}
              stepSize={1}
              labelStepSize={Math.max(
                1,
                2 ** (Math.floor(Math.log2(reducedItemStack.count)) - 2),
              )}
            /> */}
            <NumericInput
              disabled={!selectedStorage || !itemCountInOtherStorages}
              fill
              width={'50px'}
              value={quantity}
              onValueChange={(value) => setQuantity(value)}
              stepSize={1}
              min={1}
              // intentionally using || to catch if value is 0
              max={itemCountInOtherStorages || undefined}
            />
          </div>
        </div>
        <div>Transfer Breakdown</div>
        <div>
          <Button intent="primary">Transfer</Button>
        </div>
      </div>
    </div>
  );
});

const filterInventoryLocationListItem: ItemPredicate<StorageInfo> = (
  query,
  storageInfo,
  _index,
  exactMatch,
) => {
  const normalizedTitle = storageInfo.name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return normalizedTitle.includes(normalizedQuery);
  }
};

const renderInventoryLocationListItem: ItemRenderer<StorageInfo> = (
  storageInfo,
  { handleClick, handleFocus, modifiers, query },
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={storageInfo.name}
      label={storageInfo.name.toString()}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${storageInfo.name}`}
    />
  );
};
