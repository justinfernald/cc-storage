import { observer } from 'mobx-react-lite';
import './App.css';

import { Card } from './components/base';
import { AppModel } from './models/AppModel';
import { absolute, flexCenter, fullSize, padding } from './styles';
import { ItemDetails, ItemStack, StorageInfo } from './interfaces/types';
import { useState } from 'react';
import { Button, Collapse, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';

const appModel = new AppModel();
appModel.fetchUpdate();

export const App = observer(() => {
  if (!appModel.storageData) {
    return (
      <div css={[absolute(), fullSize, flexCenter, padding('md')]}>
        <Card css={{}}>
          <h1>Fetching Update...</h1>
        </Card>
      </div>
    );
  }

  const { storageData } = appModel;
  const { storages } = storageData;

  return (
    <div css={[absolute(), fullSize]}>
      <Card css={{}}>
        <h1>Storages</h1>
        <div>
          {storages.map((storage) => (
            <Storage key={storage.name} storage={storage} />
          ))}
        </div>
      </Card>
    </div>
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
          {appModel.storageData?.storages.map((storage) => (
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
