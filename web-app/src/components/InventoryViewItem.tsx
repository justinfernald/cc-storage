import { observer } from 'mobx-react-lite';

import { flexBetween, flexCenterVertical, flexColumn, flexValue } from '../styles';
import { StorageSystem } from '../interfaces/types';
import { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { InventoryDialog } from './dialogs/InventoryDialog';
import { ReducedStorageInfo } from './SystemInventoryView';

export interface InventoryViewItemProps {
  storageSystem: StorageSystem;
  reducedStorageInfo: ReducedStorageInfo;
}

export const InventoryViewItem = observer((props: InventoryViewItemProps) => {
  const { reducedStorageInfo, storageSystem } = props;

  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  const openInventoryDialog = () => {
    setIsInventoryDialogOpen(true);
  };

  const closeInventoryDialog = () => {
    setIsInventoryDialogOpen(false);
  };

  return (
    <>
      <Button minimal css={[{ display: 'block' }]} onClick={openInventoryDialog}>
        <div css={[flexBetween, flexCenterVertical, { gap: 10 }]}>
          {/* <div css={[{ width: 50, height: 50 }]}>
            <img
              css={[fullSize, { objectFit: 'cover' }]}
              alt="Missing Texture"
              src="https://cravatar.eu/helmhead/AJap/100.png"
            />
          </div> */}
          <div css={[flexValue(1)]}>
            <div css={[flexBetween, flexCenterVertical]}>
              <h3>{reducedStorageInfo.name}</h3>
              <h3>{reducedStorageInfo.metaData.size}</h3>
            </div>
            <div>
              <i>{reducedStorageInfo.name}</i>
            </div>
          </div>
        </div>
      </Button>
      <InventoryDialog
        storageSystem={storageSystem}
        isOpen={isInventoryDialogOpen}
        onClose={closeInventoryDialog}
        reducedStorageInfo={reducedStorageInfo}
      />
    </>
  );
});
