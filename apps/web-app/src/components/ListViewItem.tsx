import { observer } from 'mobx-react-lite';

import { flexBetween, flexCenterVertical, flexColumn, flexValue } from '../styles';
import { StorageSystem } from 'types';
import { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { ReducedItemStack } from '../interfaces/extra-types';
import { ItemDialog } from './dialogs/ItemDialog';

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

  const lore = reducedItemStack.itemDetails.lore;

  const enchantments = reducedItemStack.itemDetails.enchantments;

  return (
    <>
      <Button minimal css={[{ display: 'block' }]} onClick={openItemDialog}>
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
                  <strong key={enchantment.name}>{enchantment.displayName}</strong>
                ))}
              </div>
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
