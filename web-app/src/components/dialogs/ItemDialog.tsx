import { observer } from 'mobx-react-lite';

import { StorageSystem } from '../../interfaces/types';
import { Dialog, DialogBody } from '@blueprintjs/core';
import { ReducedItemStack } from '../../interfaces/extra-types';
import { ItemDeliveryView } from '../ItemDeliveryView';

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
