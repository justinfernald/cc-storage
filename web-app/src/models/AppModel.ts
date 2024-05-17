import { makeAutoObservable } from 'mobx';
import { apiUrl } from '../config';
import { StorageSystem, ItemMovementPackage } from '../interfaces/types';
import { APIService } from './APIService';

export class AppModel {
  apiService = new APIService(apiUrl);

  storageSystems: Map<string, StorageSystem> | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
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
