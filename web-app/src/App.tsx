import { observer } from 'mobx-react-lite';
import './App.css';

import { Card } from './components/base';
import { AppModel } from './models/AppModel';
import {
  absolute,
  flexBetween,
  flexCenter,
  flexCenterHorizontal,
  flexCenterVertical,
  flexColumn,
  flexValue,
  fullSize,
  padding,
} from './styles';
import { ItemDetails, ItemStack, StorageInfo, StorageSystem } from './interfaces/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Collapse,
  ControlGroup,
  Dialog,
  DialogBody,
  DialogFooter,
  InputGroup,
  MenuItem,
  NumericInput,
  Panel,
  PanelStack2,
  Slider,
} from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';

const appModel = new AppModel();
appModel.fetchUpdate();

export const App = observer(() => {
  if (!appModel.storageSystems) {
    return (
      <div css={[absolute(), fullSize, flexCenter, padding('md')]}>
        <Card css={{}}>
          <h1>Fetching Update...</h1>
        </Card>
      </div>
    );
  }

  const { storageSystems } = appModel;

  return (
    <div css={[absolute(), fullSize]}>
      <PanelManager />
    </div>
  );
});

interface PanelInfo {
  title: string;
  stack: Panel<PanelInfo>[];
  onClose: () => void;
  openPanel: (panel: Panel<PanelInfo>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SystemSelectionPanelInfo extends PanelInfo {}

const SystemSelectionPanel = observer((props: SystemSelectionPanelInfo) => {
  function createPanel(
    title: string,
    renderPanel: (panelProps: PanelInfo) => JSX.Element,
  ): Panel<PanelInfo> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: {} as any,
      renderPanel: () =>
        renderPanel({
          title,
          stack: props.stack,
          onClose: props.onClose,
          openPanel: props.openPanel,
        }),
      title,
    };
  }

  const { storageSystems } = appModel;

  if (storageSystems === null) {
    return <div>Loading...</div>;
  }

  const storageSystemList = Array.from(storageSystems.values());

  return (
    <div css={[fullSize, flexCenterHorizontal, padding('md')]}>
      <div css={[{ width: 'min(90%, 600px)' }]}>
        <InputGroup />
        <div>
          {storageSystemList.map((system) => (
            <div key={system.name}>
              <div>{system.name}</div>
              <div>Storage Count: {system.storages.length}</div>
              <div>Item Count: Idk</div>
              <Button
                onClick={() =>
                  props.openPanel(
                    createPanel(system.name, (panelProps) => (
                      <SystemPanel system={system} {...panelProps} />
                    )),
                  )
                }
              >
                Open System
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

interface SystemPanelInfo extends PanelInfo {
  system: StorageSystem;
}

const SystemPanel = observer((props: SystemPanelInfo) => {
  const { system } = props;

  return (
    <div css={[fullSize, { overflow: 'auto' }]}>
      <SystemDisplay system={system} />
      {/* {system.storages.map((storage) => (
        <Storage key={storage.name} storage={storage} />
      ))} */}
    </div>
  );
});

interface SystemDisplayProps {
  system: StorageSystem;
}

enum SearchTag {
  NAME,
  DISPLAY_NAME,
  LORE,
  ENCHANTMENTS,
  TAGS,
}

enum SystemDisplayMode {
  LIST,
  INVENTORY,
}

enum SortMode {
  NAME,
  COUNT,
  DISPLAY_NAME,
}

enum SortDirection {
  ASC,
  DESC,
}

interface FilterInfo {
  search: string;
  regexMode: boolean;
  searchTags: Set<SearchTag>;
  sortMode: SortMode;
  sortDirection: SortDirection;
}

export const SystemDisplay = observer((props: SystemDisplayProps) => {
  const { system } = props;

  const [displayMode, setDisplayMode] = useState(SystemDisplayMode.LIST);
  const [filterInfo, setFilterInfo] = useState<FilterInfo>({
    search: '',
    regexMode: false,
    searchTags: new Set(),
    sortMode: SortMode.NAME,
    sortDirection: SortDirection.ASC,
  });

  return (
    <div css={[fullSize, flexCenterHorizontal]}>
      <div css={[{ width: 'min(90%, 600px)' }]}>
        <ControlGroup fill={true} vertical={false}>
          <Button
            icon={displayMode === SystemDisplayMode.LIST ? 'list' : 'box'}
            title={
              displayMode === SystemDisplayMode.LIST ? 'List View' : 'Inventory View'
            }
            onClick={() => {
              setDisplayMode((mode) =>
                mode === SystemDisplayMode.LIST
                  ? SystemDisplayMode.INVENTORY
                  : SystemDisplayMode.LIST,
              );
            }}
          />
          <InputGroup fill={true} rightElement={<Button minimal icon="filter-list" />} />
        </ControlGroup>
        {displayMode === SystemDisplayMode.LIST && (
          <SystemListView filterInfo={filterInfo} system={system} />
        )}
        {displayMode === SystemDisplayMode.INVENTORY && (
          <SystemInventoryView filterInfo={filterInfo} system={system} />
        )}
      </div>
    </div>
  );
});
interface SystemListViewProps {
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

export interface ListViewItemProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
}

export const ListViewItem = observer((props: ListViewItemProps) => {
  const { reducedItemStack, storageSystem } = props;

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const openItemDialog = () => {
    setIsItemDialogOpen(true);
  };

  const closeItemDialog = () => {
    setIsItemDialogOpen(false);
  };

  if (!reducedItemStack.itemDetails) {
    return null;
  }

  let lore = reducedItemStack.itemDetails.lore;

  if (!Array.isArray(lore)) {
    lore = null;
  }

  let enchantments = reducedItemStack.itemDetails.enchantments;

  if (!Array.isArray(enchantments)) {
    enchantments = null;
  }

  return (
    <>
      <Button minimal css={[{ display: 'block' }]} onClick={openItemDialog}>
        <div css={[flexBetween, flexCenterVertical, { gap: 10 }]}>
          <div css={[{ width: 50, height: 50 }]}>
            <img
              css={[fullSize, { objectFit: 'cover' }]}
              alt="Missing Texture"
              src="https://cravatar.eu/helmhead/AJap/600.png"
            />
          </div>
          <div css={[flexValue(1)]}>
            <div css={[flexBetween, flexCenterVertical]}>
              <h3>{reducedItemStack.itemDetails.displayName}</h3>
              <h3>{reducedItemStack.count}</h3>
            </div>
            <div>
              <i>{reducedItemStack.name}</i>
              <div css={[flexColumn]}>
                {lore?.map((loreText, i) => (
                  <strong key={i}>{loreText}</strong>
                ))}
              </div>
              <div css={[flexColumn]}>
                {enchantments?.map((enchantment) => (
                  <strong key={enchantment.name}>
                    {enchantment.displayName} {enchantment.level}
                  </strong>
                ))}
              </div>
              {/* <div>
              Storage Count:
              {reducedItemStack.reducedItemStackStorageInfo.map((storageInfo) => (
                <div key={`${storageInfo.storageName}:${storageInfo.slot}`}>
                  {storageInfo.storageName} ({storageInfo.slot}): {storageInfo.count}
                </div>
              ))}
            </div> */}
            </div>
          </div>
        </div>
      </Button>
      <ItemDialog
        storageSystem={storageSystem}
        isOpen={isItemDialogOpen}
        onClose={closeItemDialog}
        reducedItemStack={reducedItemStack}
      />
    </>
  );
});

export interface ItemDialogProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
  isOpen: boolean;
  onClose?(): void;
}

export const ItemDialog = observer((props: ItemDialogProps) => {
  const { storageSystem, reducedItemStack, isOpen, onClose } = props;

  if (!reducedItemStack.itemDetails) {
    return null;
  }

  return (
    <Dialog title="Move Item" icon="inheritance" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <ItemDeliveryView
          storageSystem={storageSystem}
          reducedItemStack={reducedItemStack}
        />
      </DialogBody>
    </Dialog>
  );
});

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

  return (
    <div css={[flexColumn, { gap: 5 }]}>
      <h3>{reducedItemStack.itemDetails.displayName}</h3>
      <div css={[flexColumn, { gap: 5 }]}>
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
            width={'50px'}
            value={quantity}
            onValueChange={(value) => setQuantity(value)}
            stepSize={1}
            min={1}
            max={reducedItemStack.count}
          />
        </div>
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
              text={selectedStorage?.name ?? 'Select Inventory Location'}
              rightIcon="double-caret-vertical"
            />
          </Select>
        </div>
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

interface ReducedItemStackStorageInfo {
  storageName: string;
  slot: number;
  count: number;
}

interface ReducedItemStack extends Omit<ItemStack, 'slot'> {
  reducedItemStackStorageInfo: ReducedItemStackStorageInfo[];
}
interface SystemInventoryViewProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

export const SystemInventoryView = observer((props: SystemInventoryViewProps) => {
  const { system } = props;

  return <div></div>;
});

export const PanelManager = observer(() => {
  function createPanel(
    title: string,
    renderPanel: (panelProps: PanelInfo) => JSX.Element,
  ): Panel<PanelInfo> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: {} as any,
      renderPanel: () =>
        renderPanel({
          title,
          stack: currentPanelStack,
          onClose: popPanel,
          openPanel: pushPanel,
        }),
      title,
    };
  }

  const systemSelectionPanel = createPanel('System Selection', (panelProps) => (
    <SystemSelectionPanel {...panelProps} />
  ));

  const [currentPanelStack, setCurrentPanelStack] = useState<Panel<PanelInfo>[]>([
    systemSelectionPanel,
  ]);

  useEffect(() => {
    // const interval = setInterval(() => {
    //   setCurrentPanelStack((currentPanelStack) => {
    //     return [...currentPanelStack, newPanel];
    //   });
    // }, 5000);
    // return () => clearInterval(interval);
  }, []);

  const popPanel = () => {
    setCurrentPanelStack((currentPanelStack) => {
      const newPanelStack = [...currentPanelStack];
      newPanelStack.pop();
      return newPanelStack;
    });
  };

  const pushPanel = (panel: Panel<PanelInfo>) => {
    setCurrentPanelStack((currentPanelStack) => {
      return [...currentPanelStack, panel];
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <PanelStack2<Panel<any>>
      css={[fullSize]}
      stack={currentPanelStack}
      onClose={popPanel}
    />
  );
});

export interface StorageProps {
  storage: StorageInfo;
}

export const Storage = observer((props: StorageProps) => {
  const { storage } = props;
  const { name, metaData } = storage;
  let { itemStacks } = storage;

  if (!Array.isArray(itemStacks)) {
    itemStacks = [];
  }

  return (
    <div>
      <h2>{name}</h2>
      <p>Size: {metaData.size}</p>
      <div>
        {itemStacks.map((itemStack) => (
          <ItemStackView key={itemStack.slot} storage={storage} itemStack={itemStack} />
        ))}
      </div>
    </div>
  );
});

export interface ItemStackProps {
  itemStack: ItemStack;
  storage: StorageInfo;
}

export const ItemStackView = observer((props: ItemStackProps) => {
  const { itemStack, storage } = props;
  const { slot, name, count, itemDetails } = itemStack;

  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleItemMove = (toStorage: string) => {
    appModel.moveItems({
      moves: [
        {
          from: storage.name,
          to: toStorage,
          fromSlot: slot,
          toSlot: null,
          quantity: null,
        },
      ],
    });
    setIsMoveDialogOpen(false);
  };

  const handleMoveClick = () => {
    setIsMoveDialogOpen(true);
  };

  const handleDetailsClick = () => {
    setIsDetailsOpen((isDetailsOpen) => !isDetailsOpen);
  };

  if (!itemDetails) {
    return (
      <div>
        <h3>Slot: {slot}</h3>
        <p>Name: {name}</p>
        <p>Count: {count}</p>
      </div>
    );
  }

  const { displayName } = itemDetails;

  const { storageSystems } = appModel;
  if (storageSystems === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>Slot: {slot}</h3>
      <p>Name: {name}</p>
      <p>Display Name: {displayName}</p>
      <p>Count: {count}</p>
      <Button onClick={handleMoveClick}>Move Item</Button>
      <Button onClick={handleDetailsClick}>
        {isDetailsOpen ? 'Hide Details' : 'Show Details'}
      </Button>
      <Collapse isOpen={isDetailsOpen}>
        {<ItemDetailsView itemDetails={itemDetails} />}
      </Collapse>
      <Dialog
        title="Select Inventory you would like to move this item to:"
        icon="info-sign"
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
      >
        <DialogBody>
          {Array.from(storageSystems.values()).map((storage) => (
            <Button key={storage.name} onClick={() => handleItemMove(storage.name)}>
              {storage.name}
            </Button>
          ))}
        </DialogBody>
        <DialogFooter
          actions={
            <Button
              intent="primary"
              text="Close"
              onClick={() => setIsMoveDialogOpen(false)}
            />
          }
        />
      </Dialog>
    </div>
  );
});

export interface ItemDetailsProps {
  itemDetails: ItemDetails;
}

export const ItemDetailsView = observer((props: ItemDetailsProps) => {
  return (
    <div css={[padding('sm'), { background: '#eee' }]}>
      <pre>{JSON.stringify(props.itemDetails, null, 2)}</pre>
    </div>
  );
});
