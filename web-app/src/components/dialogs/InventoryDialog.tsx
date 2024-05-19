import { observer } from 'mobx-react-lite';

import { StorageSystem } from '../../interfaces/types';
import { Dialog, DialogBody } from '@blueprintjs/core';
import { ReducedStorageInfo } from '../SystemInventoryView';

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
      <DialogBody>{isOpen && <>Hiiiii</>}</DialogBody>
    </Dialog>
  );
});
