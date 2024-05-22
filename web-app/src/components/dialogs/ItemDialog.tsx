import { observer } from 'mobx-react-lite';

import { StorageSystem } from '@cc-storage/common/src/types/types';
import { Dialog, DialogBody, Tab, Tabs } from '@blueprintjs/core';
import { ReducedItemStack } from '../../interfaces/extra-types';
import { ItemDeliveryView } from '../ItemDeliveryView';
import { ItemDetailsView } from '../ItemDetailsView';

export interface ItemDialogProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
  isOpen: boolean;
  onClose?(): void;
}

export const ItemDialog = observer((props: ItemDialogProps) => {
  const { storageSystem, reducedItemStack, isOpen, onClose } = props;

  return (
    <Dialog
      title={reducedItemStack.itemDetails.displayName}
      icon="cube"
      isOpen={isOpen}
      onClose={onClose}
    >
      <DialogBody>
        {isOpen && (
          <Tabs large>
            <Tab
              id="delivery"
              title="Delivery"
              panel={
                <ItemDeliveryView
                  storageSystem={storageSystem}
                  reducedItemStack={reducedItemStack}
                />
              }
            />
            <Tab
              id="item-details"
              title="Item Details"
              panel={
                <ItemDetailsView
                  storageSystem={storageSystem}
                  reducedItemStack={reducedItemStack}
                />
              }
            />
          </Tabs>
        )}
      </DialogBody>
    </Dialog>
  );
});
