import { makeAutoObservable } from 'mobx';
import { apiUrl, wsUrl } from '../config';
import {
  StorageSystem,
  ItemMovementPackage,
  StorageSystemUpdate,
} from '../interfaces/types';
import { APIService } from './APIService';
import { WSService } from './WSService';

export class AppModel {
  apiService = new APIService(apiUrl);
  wsService = new WSService(wsUrl);

  storageSystems = new Map<string, StorageSystem>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    this.setupAutoUpdate();
  }

  setupAutoUpdate() {
    const disposer = this.wsService.addStorageSystemChangeListener(this.updateHandler);

    return disposer;
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
  }

  async moveItems(data: ItemMovementPackage) {
    await this.apiService.moveItems(data);

    // setTimeout(() => {
    //   this.updateStorageSystemCollection();
    // }, 3_000);
  }
}
