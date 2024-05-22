import { makeAutoObservable } from 'mobx';
import { apiUrl, wsUrl } from '../config';
import {
  StorageSystem,
  ItemMovementPackage,
  StorageSystemUpdate,
  InventoryInfo,
  StorageInfo,
} from '@cc-storage/common/src/types';
import { APIService } from './APIService';
import { WSService } from './WSService';

export class HistoryModel {
  lastStorageDestination?: string;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
}

export class AppModel {
  apiService = new APIService(apiUrl);
  wsService = new WSService(wsUrl);
  historyModel = new HistoryModel();

  storageSystems = new Map<string, StorageSystem>();

  inventoryInfoMap = new Map<string, InventoryInfo>();
  storageInfoMap = new Map<string, StorageInfo>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    ``;

    this.setupAutoUpdate();
    this.setupInventoryInfoMap();
  }

  setupAutoUpdate() {
    const disposer = this.wsService.addStorageSystemChangeListener(this.updateHandler);

    return disposer;
  }

  setupInventoryInfoMap() {
    this.apiService.getInventoryInfoCollection().then((data) => {
      for (const info of data) {
        this.inventoryInfoMap.set(info.name, info);
      }
    });
  }

  getInventoryInfo(name: string) {
    return this.inventoryInfoMap.get(name);
  }

  getStorageInfo(name: string) {
    console.log(this.storageInfoMap);
    return this.storageInfoMap.get(name);
  }

  async updateInventoryInfo(info: InventoryInfo) {
    await this.apiService.postInventoryInfo(info);

    this.inventoryInfoMap.set(info.name, info);
  }

  updateHandler(data: StorageSystemUpdate) {
    const system = this.storageSystems.get(data.storageSystem.name);
    if (system) {
      console.log('Updating storage system:', data.storageSystem.name);
      system.storages = data.storageSystem.storages;
    } else {
      console.log('Adding new storage system:', data.storageSystem.name);
      this.storageSystems.set(data.storageSystem.name, data.storageSystem);
    }
    this.updateStorageInfoMap([data.storageSystem]);
  }

  updateStorageInfoMap(systems: StorageSystem[]) {
    // TODO: Remove storages that are no longer in update
    for (const storageSystem of systems) {
      for (const storageInfo of storageSystem.storages) {
        this.storageInfoMap.set(storageInfo.name, storageInfo);
      }
    }
  }

  async fetchUpdate() {
    await this.apiService.fetchUpdate();

    // setTimeout(() => {
    //   this.updateStorageSystemCollection();
    // }, 1_000);
  }

  async updateStorageSystemCollection() {
    const systems = await this.apiService.getStorageSystemCollection();

    if (!this.storageSystems) {
      this.storageSystems = new Map();
    }

    for (const system of systems) {
      this.storageSystems.set(system.name, system);
    }

    this.updateStorageInfoMap(systems);
  }

  async moveItems(data: ItemMovementPackage) {
    await this.apiService.moveItems(data);

    // setTimeout(() => {
    //   this.updateStorageSystemCollection();
    // }, 3_000);
  }
}
