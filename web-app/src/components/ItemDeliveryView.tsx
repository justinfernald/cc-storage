import { observer } from 'mobx-react-lite';

import { flex, flexColumn } from '../styles';
import { ItemMovementPackage, StorageInfo, StorageSystem } from '../interfaces/types';
import {
  Button,
  Callout,
  Collapse,
  HTMLSelect,
  HTMLTable,
  MenuItem,
  NumericInput,
} from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import { ReducedItemStack, StorageSlotInfo } from '../interfaces/extra-types';
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';
import { appModel } from '../App';

interface ItemDeliveryViewModelProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
}

interface GroupedStorageSlots {
  storageName: string;
  count: number;
  slotInfo: StorageSlotInfo[];
}

class ItemDeliveryViewModel extends BaseViewModel<ItemDeliveryViewModelProps> {
  quantity = 1;
  selectedStorage: StorageInfo | null = null;
  showTransferBreakdown = false;

  transferStrategy = TransferStrategy.SCARCE_FIRST;

  constructor(props: ItemDeliveryViewModelProps) {
    super(props);
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }

  get systemName() {
    return this.props.storageSystem.name;
  }

  get validForTransfer(): boolean {
    return this.selectedStorage !== null && this.quantity > 0;
  }

  get selectedStorageSlots() {
    if (!this.selectedStorage) {
      return null;
    }

    return this.props.reducedItemStack.storageSlotInfo.filter(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (s) => s.storageName === this.selectedStorage!.name,
    );
  }

  get otherStorageSlots() {
    if (!this.selectedStorage) {
      return null;
    }

    return this.props.reducedItemStack.storageSlotInfo.filter(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (s) => s.storageName !== this.selectedStorage!.name,
    );
  }

  get otherGroupedStorageSlots(): Map<string, GroupedStorageSlots> | null {
    // group by storageName
    if (!this.otherStorageSlots) {
      return null;
    }

    /** key is storageName */
    const groupedStorageSlots = new Map<string, GroupedStorageSlots>();

    for (const slot of this.otherStorageSlots) {
      const storageSlotInfo = groupedStorageSlots.get(slot.storageName);

      if (storageSlotInfo) {
        storageSlotInfo.slotInfo.push(slot);
        storageSlotInfo.count += slot.count;
      } else {
        groupedStorageSlots.set(slot.storageName, {
          storageName: slot.storageName,
          count: slot.count,
          slotInfo: [slot],
        });
      }
    }

    return groupedStorageSlots;
  }

  get itemCount() {
    return this.props.reducedItemStack.count;
  }
  get itemCountInSelectedStorage() {
    if (!this.selectedStorageSlots) {
      return null;
    }

    return this.selectedStorageSlots.reduce((acc, s) => acc + s.count, 0);
  }
  get itemCountInOtherStorages() {
    if (this.itemCountInSelectedStorage === null) {
      return null;
    }

    return this.itemCount - this.itemCountInSelectedStorage;
  }

  setSelectedStorage(storage: StorageInfo) {
    this.selectedStorage = storage;
  }

  toggleTransferBreakdown() {
    this.showTransferBreakdown = !this.showTransferBreakdown;
  }

  setQuantity(quantity: number) {
    if (quantity < 1) {
      quantity = 1;
    } else if (!this.itemCountInOtherStorages) {
      quantity = 1;
    } else if (quantity > this.itemCountInOtherStorages) {
      quantity = this.itemCountInOtherStorages;
    }

    this.quantity = quantity;
  }

  setTransferStrategy(transferStrategy: TransferStrategy) {
    this.transferStrategy = transferStrategy;
  }

  onTransferStrategySelect(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setTransferStrategy(event.target.value as TransferStrategy);
  }

  get breakdown(): ItemMovementPackage {
    switch (this.transferStrategy) {
      case TransferStrategy.PLENTIFUL_FIRST:
        return this.plentifulFirst();
      case TransferStrategy.SCARCE_FIRST:
        return this.scarceFirst();
      case TransferStrategy.PROPORTIONAL:
        return this.proportional();
      case TransferStrategy.ROUND_ROBIN:
        return this.roundRobin();
    }
  }

  transfer() {
    const moves = this.breakdown;

    if (moves.moves.length === 0) {
      return;
    }

    appModel.apiService.moveItems(this.breakdown);
  }

  plentifulFirst(): ItemMovementPackage {
    if (!this.selectedStorage || !this.otherGroupedStorageSlots) {
      return { systemName: this.systemName, moves: [] };
    }

    const otherGroupedStorageSlots = Array.from(this.otherGroupedStorageSlots.values());

    otherGroupedStorageSlots.sort((a, b) => b.count - a.count);

    const moves: ItemMovementPackage = { systemName: this.systemName, moves: [] };

    let remaining = this.quantity;

    for (const groupedStorageSlots of otherGroupedStorageSlots) {
      for (const slot of groupedStorageSlots.slotInfo) {
        if (remaining <= 0) {
          break;
        }

        const moveCount = Math.min(remaining, slot.count);

        if (moveCount > 0) {
          moves.moves.push({
            from: slot.storageName,
            to: this.selectedStorage.name,
            fromSlot: slot.slot,
            toSlot: null,
            quantity: moveCount,
          });
        }

        remaining -= moveCount;
      }
    }

    return moves;
  }

  scarceFirst(): ItemMovementPackage {
    if (!this.selectedStorage || !this.otherGroupedStorageSlots) {
      return { systemName: this.systemName, moves: [] };
    }

    const otherGroupedStorageSlots = Array.from(this.otherGroupedStorageSlots.values());

    otherGroupedStorageSlots.sort((a, b) => a.count - b.count);

    const moves: ItemMovementPackage = { systemName: this.systemName, moves: [] };

    let remaining = this.quantity;

    for (const groupedStorageSlots of otherGroupedStorageSlots) {
      for (const slot of groupedStorageSlots.slotInfo) {
        if (remaining <= 0) {
          break;
        }

        const moveCount = Math.min(remaining, slot.count);

        if (moveCount > 0) {
          moves.moves.push({
            from: slot.storageName,
            to: this.selectedStorage.name,
            fromSlot: slot.slot,
            toSlot: null,
            quantity: moveCount,
          });
        }

        remaining -= moveCount;
      }
    }

    return moves;
  }

  proportional(): ItemMovementPackage {
    if (!this.selectedStorage || !this.otherGroupedStorageSlots) {
      return { systemName: this.systemName, moves: [] };
    }

    const otherGroupedStorageSlots = Array.from(this.otherGroupedStorageSlots.values());

    const totalItemCount = otherGroupedStorageSlots.reduce((acc, s) => acc + s.count, 0);

    const moves: ItemMovementPackage = { systemName: this.systemName, moves: [] };

    let remaining = this.quantity;

    for (const groupedStorageSlots of otherGroupedStorageSlots) {
      for (const slot of groupedStorageSlots.slotInfo) {
        if (remaining <= 0) {
          break;
        }

        const moveCount = Math.min(
          remaining,
          Math.floor((slot.count / totalItemCount) * this.quantity),
        );

        if (moveCount > 0) {
          moves.moves.push({
            from: slot.storageName,
            to: this.selectedStorage.name,
            fromSlot: slot.slot,
            toSlot: null,
            quantity: moveCount,
          });
        }

        remaining -= moveCount;
      }
    }

    return moves;
  }

  // take from each storage in a round-robin fashion until quantity is reached
  roundRobin(): ItemMovementPackage {
    if (!this.selectedStorage || !this.otherGroupedStorageSlots) {
      return { systemName: this.systemName, moves: [] };
    }

    const moves: ItemMovementPackage = { systemName: this.systemName, moves: [] };

    const otherGroupedStorageSlots = Array.from(this.otherGroupedStorageSlots.values());

    const copiedStorages: GroupedStorageSlots[] = otherGroupedStorageSlots.map(
      (storage) => ({
        count: storage.count,
        slotInfo: storage.slotInfo.map((slot) => ({
          storageName: slot.storageName,
          count: slot.count,
          slot: slot.slot,
        })),
        storageName: storage.storageName,
      }),
    );

    let remaining = this.quantity;

    while (remaining > 0) {
      for (const storage of copiedStorages) {
        if (remaining <= 0) {
          break;
        }

        if (storage.count > 0) {
          // Remove one item from the storage
          storage.count--;
          remaining--;

          // Find the first non-empty slot in the storage
          const slotIndex = storage.slotInfo.findIndex((slot) => slot.count > 0);
          if (slotIndex !== -1) {
            // Remove one item from the slot
            storage.slotInfo[slotIndex].count--;

            // Add a move
            moves.moves.push({
              from: storage.storageName,
              to: this.selectedStorage.name,
              fromSlot: storage.slotInfo[slotIndex].slot,
              toSlot: null,
              quantity: 1,
            });

            // If the slot is now empty, remove it from the storage
            if (storage.slotInfo[slotIndex].count === 0) {
              storage.slotInfo.splice(slotIndex, 1);
            }
          }

          // If the storage is now empty, remove it from the options
          if (storage.count === 0) {
            const storageIndex = copiedStorages.findIndex(
              (s) => s.storageName === storage.storageName,
            );
            if (storageIndex !== -1) {
              copiedStorages.splice(storageIndex, 1);
            }
          }
        }
      }
    }

    // group moves together by storage / slot
    const finalMoves: ItemMovementPackage = { systemName: this.systemName, moves: [] };

    for (const move of moves.moves) {
      const existingMove = finalMoves.moves.find(
        (m) => m.from === move.from && m.to === move.to && m.fromSlot === move.fromSlot,
      );

      if (existingMove) {
        existingMove.quantity = (existingMove.quantity ?? 0) + (move.quantity ?? 0);
      } else {
        finalMoves.moves.push(move);
      }
    }

    return finalMoves;
  }
}

interface SummarizedMove {
  storageName: string;
  count: number;
}

function summarizeMoves(moves: ItemMovementPackage): SummarizedMove[] {
  // group storages and sum up their counts
  const storageCounts = new Map<string, number>();

  for (const move of moves.moves) {
    const count = storageCounts.get(move.from) ?? 0;
    storageCounts.set(move.from, count + (move.quantity ?? 0));
  }

  return Array.from(storageCounts.entries()).map(([storageName, count]) => ({
    storageName,
    count,
  }));
}

export interface ItemDeliveryViewProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
}

export const ItemDeliveryView = observer((props: ItemDeliveryViewProps) => {
  const { storageSystem, reducedItemStack } = props;

  const viewModel = useViewModelConstructor(ItemDeliveryViewModel, props);

  const { quantity, selectedStorage, showTransferBreakdown } = viewModel;

  if (!reducedItemStack.itemDetails) {
    return null;
  }

  return (
    <div css={[flexColumn, { gap: 5 }]}>
      <div css={[flexColumn, { gap: 5 }]}>
        <div css={[flexColumn, { gap: 5, width: 300, alignSelf: 'center' }]}>
          <div>
            Inventory
            <Select<StorageInfo>
              items={storageSystem.storages}
              itemPredicate={filterInventoryLocationListItem}
              itemRenderer={renderInventoryLocationListItem}
              noResults={
                <MenuItem disabled={true} text="No results." roleStructure="listoption" />
              }
              onItemSelect={viewModel.setSelectedStorage}
            >
              <Button
                fill
                text={selectedStorage?.name ?? 'Select Inventory Location'}
                rightIcon="double-caret-vertical"
              />
            </Select>
          </div>
          <div>
            Quantity <span>Max: {viewModel.itemCountInOtherStorages}</span>
            <NumericInput
              disabled={!selectedStorage || !viewModel.itemCountInOtherStorages}
              fill
              value={quantity}
              onValueChange={viewModel.setQuantity}
              stepSize={1}
              min={1}
              // intentionally using || to catch if value is 0
              max={viewModel.itemCountInOtherStorages || undefined}
            />
          </div>
          <Button
            minimal
            fill
            rightIcon={showTransferBreakdown ? 'chevron-up' : 'chevron-down'}
            css={[{ alignSelf: 'center' }]}
            onClick={viewModel.toggleTransferBreakdown}
          >
            Transfer Breakdown
          </Button>
          <Collapse isOpen={showTransferBreakdown}>
            <div css={[flexColumn]}>
              <HTMLSelect
                value={viewModel.transferStrategy}
                onChange={viewModel.onTransferStrategySelect}
                options={Object.values(TransferStrategy)}
              />
            </div>
            <HTMLTable css={[{ width: '100%' }]}>
              <thead>
                <tr>
                  <th>Storage</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {summarizeMoves(viewModel.breakdown).map((move) => (
                  <tr key={move.storageName}>
                    <td>{move.storageName}</td>
                    <td>{move.count}</td>
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
            {/* {summarizeMoves(viewModel.breakdown).map((move) => (
              <div key={move.storageName}>
                {move.storageName}: {move.count}
              </div>
            ))} */}
          </Collapse>
        </div>
        {viewModel.validForTransfer && (
          <Callout title="Proceed with caution" intent="warning">
            Current features do not support checking if selected transfer payload will fit
            in targeted inventory.
          </Callout>
        )}

        <div css={[flex('row'), { justifyContent: 'end' }]}>
          <Button
            disabled={!viewModel.validForTransfer}
            intent="primary"
            onClick={viewModel.transfer}
          >
            Transfer
          </Button>
        </div>
      </div>
    </div>
  );
});

export enum TransferStrategy {
  PLENTIFUL_FIRST = 'Plentiful First',
  SCARCE_FIRST = 'Scarce First',
  PROPORTIONAL = 'Proportional',
  ROUND_ROBIN = 'Round Robin',
}

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
