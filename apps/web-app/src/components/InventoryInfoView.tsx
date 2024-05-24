import { observer } from 'mobx-react-lite';
import { InventoryInfo, StorageSystem } from 'types';
import { ReducedStorageInfo } from './SystemInventoryView';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { appModel } from '../App';
import { useState } from 'react';
import { FlexRow } from './base/Flex';
import {
  Button,
  ButtonGroup,
  InputGroup,
  Label,
  NumericInput,
  TextArea,
} from '@blueprintjs/core';
import { absolute, relative } from '../styles';
import { action } from 'mobx';

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

  toDTO() {
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

  get hasChanges() {
    return !this.inventoryInfoModel.equals(this.inventoryInfoModelCopy);
  }

  onDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.inventoryInfoModelCopy.inventoryInfo.displayName = event.target.value;
  };

  onLocationChange = (value: number, axis: 0 | 1 | 2) => {
    const inventoryInfoCopy = this.inventoryInfoModelCopy.inventoryInfo;
    switch (axis) {
      case 0:
        inventoryInfoCopy.locationX = value;
        break;
      case 1:
        inventoryInfoCopy.locationY = value;
        break;
      case 2:
        inventoryInfoCopy.locationZ = value;
        break;
    }
  };

  onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.inventoryInfoModelCopy.inventoryInfo.description = event.target.value;
  };
}

export interface InventoryInfoViewProps {
  storageSystem: StorageSystem;
  reducedStorageInfo: ReducedStorageInfo;
}

export const InventoryInfoView = observer((props: InventoryInfoViewProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const viewModel = useViewModelConstructor(InventoryInfoViewModel, props);

  const inventoryInfo = viewModel.inventoryInfoModel.inventoryInfo;
  const inventoryInfoCopy = viewModel.inventoryInfoModelCopy.inventoryInfo;

  const cancelEdits = () => {
    viewModel.inventoryInfoModelCopy = viewModel.inventoryInfoModel.clone();
    setIsEditing(false);
  };

  const saveEdits = () => {
    viewModel.inventoryInfoModel.inventoryInfo =
      viewModel.inventoryInfoModelCopy.inventoryInfo;
    viewModel.inventoryInfoModelCopy = viewModel.inventoryInfoModel.clone();
    viewModel.inventoryInfoModel.upload();
    setIsEditing(false);
  };

  return (
    <div css={[relative()]}>
      <div css={[{ width: '80%' }]}>
        <Label>
          Display Name:
          <InputGroup
            value={inventoryInfoCopy.displayName ?? undefined}
            onChange={viewModel.onDisplayNameChange}
            readOnly={!isEditing}
          />
        </Label>
        <p>Name: {inventoryInfo.name}</p>

        <FlexRow>
          <Label>
            X:
            <NumericInput
              css={[{ '&>div': { width: '70px' } }]}
              value={inventoryInfoCopy.locationX ?? 0}
              onValueChange={(value) => viewModel.onLocationChange(value, 0)}
              stepSize={1}
              readOnly={!isEditing}
            />
          </Label>
          <Label>
            Y:
            <NumericInput
              css={[{ '&>div': { width: '70px' } }]}
              value={inventoryInfoCopy.locationY ?? 0}
              onValueChange={(value) => viewModel.onLocationChange(value, 1)}
              stepSize={1}
              readOnly={!isEditing}
            />
          </Label>
          <Label>
            Z:
            <NumericInput
              css={[{ '&>div': { width: '70px' } }]}
              value={inventoryInfoCopy.locationZ ?? 0}
              onValueChange={(value) => viewModel.onLocationChange(value, 2)}
              stepSize={1}
              readOnly={!isEditing}
            />
          </Label>
        </FlexRow>
        <Label>
          Description:
          <TextArea
            value={inventoryInfoCopy.description ?? undefined}
            onChange={viewModel.onDescriptionChange}
            readOnly={!isEditing}
          />
        </Label>
      </div>
      {isEditing ? (
        <FlexRow css={[absolute(0, 0)]}>
          <ButtonGroup>
            <Button
              onClick={action(saveEdits)}
              icon="tick"
              intent="success"
              disabled={!viewModel.hasChanges}
            />
            <Button onClick={action(cancelEdits)} icon="cross" intent="danger" />
          </ButtonGroup>
        </FlexRow>
      ) : (
        <Button onClick={() => setIsEditing(true)} icon="edit" css={[absolute(0, 0)]} />
      )}
    </div>
  );
});
