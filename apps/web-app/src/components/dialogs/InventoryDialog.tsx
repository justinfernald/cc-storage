import { observer } from 'mobx-react-lite';

import { StorageSystem } from 'types';
import { Dialog, DialogBody, Tab, Tabs } from '@blueprintjs/core';
import { ReducedStorageInfo } from '../SystemInventoryView';
import { InventoryInfoView } from '../InventoryInfoView';

export interface InventoryDialogProps {
  storageSystem: StorageSystem;
  reducedStorageInfo: ReducedStorageInfo;
  isOpen: boolean;
  onClose?(): void;
}

export const InventoryDialog = observer((props: InventoryDialogProps) => {
  const { storageSystem, reducedStorageInfo, isOpen, onClose } = props;

  return (
    <Dialog title={reducedStorageInfo.name} icon="cube" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        {isOpen && (
          <InventoryInfoView
            storageSystem={storageSystem}
            reducedStorageInfo={reducedStorageInfo}
          />
        )}
      </DialogBody>
    </Dialog>
  );
});
