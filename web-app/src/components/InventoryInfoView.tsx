import { observer } from 'mobx-react-lite';
import { InventoryInfo, StorageSystem } from '@cc-storage/common/src/types';
import { ReducedStorageInfo } from './SystemInventoryView';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { appModel } from '../App';
import { useState } from 'react';

class InventoryInfoModel {
  static fromDTO(dto: InventoryInfo) {
    return new InventoryInfoModel(dto);
  }

  static fromName(name: string) {
    return InventoryInfoModel.fromDTO(
      appModel.getInventoryInfo(name) ?? {
        description: null,
        displayName: name,
        locationWorld: null,
        locationX: null,
        locationY: null,
        locationZ: null,
        name: name,
        tags: [],
      },
    );
  }

  constructor(public inventoryInfo: InventoryInfo) {
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }

  toDTO(): InventoryInfo {
    return {
      name: this.inventoryInfo.name,
      displayName: this.inventoryInfo.displayName,
      description: this.inventoryInfo.description,
      locationWorld: this.inventoryInfo.locationWorld,
      locationX: this.inventoryInfo.locationX,
      locationY: this.inventoryInfo.locationY,
      locationZ: this.inventoryInfo.locationZ,
      tags: [],
    };
  }

  clone() {
    return InventoryInfoModel.fromDTO(this.toDTO());
  }

  equals(other: InventoryInfoModel) {
    return JSON.stringify(this.toDTO()) === JSON.stringify(other.toDTO());
  }

  upload() {
    appModel.updateInventoryInfo(this.toDTO());
  }
}

class InventoryInfoViewModel extends BaseViewModel<InventoryInfoViewProps> {
  inventoryInfoModel: InventoryInfoModel;
  inventoryInfoModelCopy: InventoryInfoModel;

  constructor(props: InventoryInfoViewProps) {
    super(props);
    makeSimpleAutoObservable(this, {}, { autoBind: true });

    this.inventoryInfoModel = InventoryInfoModel.fromName(props.reducedStorageInfo.name);
    this.inventoryInfoModelCopy = this.inventoryInfoModel.clone();
  }
}

export interface InventoryInfoViewProps {
  storageSystem: StorageSystem;
  reducedStorageInfo: ReducedStorageInfo;
}

export const InventoryInfoView = observer((props: InventoryInfoViewProps) => {
  const { storageSystem, reducedStorageInfo } = props;

  const [isEditing, setIsEditing] = useState(false);

  const viewModel = useViewModelConstructor(InventoryInfoViewModel, props);

  const inventoryInfo = viewModel.inventoryInfoModel.inventoryInfo;

  return (
    <div>
      <div>
        <h3>{inventoryInfo.displayName}</h3>
        <p>{inventoryInfo.name}</p>
        <p>
          Location: ({inventoryInfo.locationX}, {inventoryInfo.locationY},
          {inventoryInfo.locationZ}) [{inventoryInfo.locationWorld}]
        </p>
        <p>{inventoryInfo.description}</p>
      </div>
    </div>
  );
});
