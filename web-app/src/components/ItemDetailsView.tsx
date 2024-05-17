import { observer } from 'mobx-react-lite';

import { flexColumn } from '../styles';
import { StorageSystem } from '../interfaces/types';
import { ReducedItemStack } from '../interfaces/extra-types';

export interface ItemDetailsViewProps {
  storageSystem: StorageSystem;
  reducedItemStack: ReducedItemStack;
}
export const ItemDetailsView = observer((props: ItemDetailsViewProps) => {
  const { storageSystem, reducedItemStack } = props;

  if (!reducedItemStack.itemDetails) {
    return null;
  }

  // Item Display Name
  // Item Name
  // Total Item Count
  // Lore
  // Enchantments
  // Tags
  // durability
  // maxCount
  // maxDamage

  // storage locations
  // total amount for storage
  // slots in storage and amount

  let lore = reducedItemStack.itemDetails.lore;

  if (!Array.isArray(lore)) {
    lore = null;
  }

  let enchantments = reducedItemStack.itemDetails.enchantments;

  if (!Array.isArray(enchantments)) {
    enchantments = null;
  }

  const tagsList = Object.entries(reducedItemStack.itemDetails.tags)
    .filter(([tag, value]) => value)
    .map(([tag]) => tag);

  return (
    <div>
      <div css={[flexColumn, { gap: 5 }]}>
        <div>
          <strong>Item Name:</strong> {reducedItemStack.name}
        </div>
        <div>
          <strong>Total Item Count:</strong> {reducedItemStack.count}
        </div>
        <div>
          <strong>Stack Size:</strong> {reducedItemStack.itemDetails.maxCount}
        </div>
        {lore !== null && (
          <div>
            <strong>Lore:</strong>
            <div css={[flexColumn, { paddingLeft: 10 }]}>
              {lore?.map((loreText, i) => (
                <span key={i}>{loreText}</span>
              ))}
            </div>
          </div>
        )}
        {enchantments !== null && (
          <div>
            <strong>Enchantments:</strong>
            <div css={[flexColumn, { paddingLeft: 10 }]}>
              {enchantments?.map((enchantment) => (
                // level is not used because it is included in display name
                <span key={enchantment.name}>{enchantment.displayName}</span>
              ))}
            </div>
          </div>
        )}
        {tagsList.length > 0 && (
          <div>
            <strong>Tags:</strong>
            <div css={[flexColumn, { paddingLeft: 10 }]}>
              {tagsList.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {reducedItemStack.itemDetails.durability != null && (
          <div>
            <strong>Durability:</strong> {reducedItemStack.itemDetails.durability}
          </div>
        )}
        {reducedItemStack.itemDetails.maxDamage != null && (
          <div>
            <strong>Max Damage:</strong> {reducedItemStack.itemDetails.maxDamage}
          </div>
        )}
        <div>
          <strong>Storage Locations:</strong>
          <div css={[flexColumn, { gap: 5, paddingLeft: 10 }]}>
            {storageSystem.storages
              .filter((storage) => {
                // only include if it has item

                if (!storage.itemStacks || !Array.isArray(storage.itemStacks)) {
                  return false;
                }

                return storage.itemStacks.some(
                  (item) => item.name === reducedItemStack.name,
                );
              })
              .map((storage) => {
                if (!storage.itemStacks || !Array.isArray(storage.itemStacks)) {
                  return null;
                }

                const storageAmount = storage.itemStacks.reduce((acc, item) => {
                  if (!item.itemDetails) {
                    return acc;
                  }

                  if (item.name === reducedItemStack.name) {
                    return acc + item.count;
                  }

                  return acc;
                }, 0);

                return (
                  <div key={storage.name}>
                    <strong>{storage.name}</strong>
                    <div css={[{ paddingLeft: 10 }]}>
                      <div>
                        <strong>Total Amount:</strong> {storageAmount}
                      </div>
                      <div>
                        <strong>Slots:</strong>
                        <div css={[{ paddingLeft: 10 }]}>
                          {storage.itemStacks.map((item) => {
                            if (!item.itemDetails) {
                              return null;
                            }
                            if (item.name === reducedItemStack.name) {
                              return (
                                <div key={item.slot}>
                                  <strong>{item.slot}: </strong>
                                  {item.count}
                                </div>
                              );
                            }

                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
});
