import { observer } from 'mobx-react-lite';
import './App.css';

import { Card } from './components/base';
import { AppModel } from './models/AppModel';
import { absolute, flexCenter, flexCenterHorizontal, fullSize, padding } from './styles';
import { ItemDetails, ItemStack, StorageInfo, StorageSystem } from './interfaces/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Collapse,
  ControlGroup,
  Dialog,
  DialogBody,
  DialogFooter,
  Icon,
  InputGroup,
  Panel,
  PanelStack2,
} from '@blueprintjs/core';

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
    const itemsMap = new Map<string, ItemStack[]>();

    for (const storage of system.storages) {
      if (!storage.itemStacks || !Array.isArray(storage.itemStacks)) {
        continue;
      }

      for (const itemStack of storage.itemStacks) {
        if (!itemsMap.has(itemStack.name)) {
          itemsMap.set(itemStack.name, []);
        }

        itemsMap.get(itemStack.name)?.push(itemStack);
      }
    }

    const reducedItemsMap = new Map<string, Map<string, ReducedItemStack>>();

    for (const [name, itemStacks] of itemsMap) {
      console.log({ name, itemStacks });
      // group them by nbtHash
      const reducedItems = new Map<string, ReducedItemStack>();
      for (const itemStack of itemStacks) {
        if (!reducedItems.has(itemStack.nbtHash)) {
          reducedItems.set(itemStack.nbtHash, itemStack);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          reducedItems.get(itemStack.nbtHash)!.count += itemStack.count;
          console.log(reducedItems.get(itemStack.nbtHash)!.count);
        }
      }
      reducedItemsMap.set(name, reducedItems);
    }

    return Array.from(reducedItemsMap.values());
  }, [system]);

  return (
    <div>
      {reducedItems.map((reducedItemStack) =>
        Array.from(reducedItemStack.values()).map((itemStack) => (
          <ListViewItem key={itemStack.slot} reducedItemStack={itemStack} />
        )),
      )}
    </div>
  );
});

export interface ListViewItemProps {
  reducedItemStack: ReducedItemStack;
}

export const ListViewItem = observer((props: ListViewItemProps) => {
  const { reducedItemStack } = props;

  return (
    <div>
      <h3>{reducedItemStack.name}</h3>
      <p>Count: {reducedItemStack.count}</p>
    </div>
  );
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ReducedItemStack extends ItemStack {}
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

  return <PanelStack2 css={[fullSize]} stack={currentPanelStack} onClose={popPanel} />;
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
