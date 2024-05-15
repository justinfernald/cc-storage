import { makeAutoObservable } from 'mobx';
import { apiUrl } from '../config';
import { InventoryUpdate, ItemMoves } from '../interfaces/types';
import { APIService } from './APIService';

export class AppModel {
  apiService = new APIService(apiUrl);

  storageData: InventoryUpdate | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchUpdate() {
    await this.apiService.fetchUpdate();

    setTimeout(() => {
      this.updateStorage();
    }, 1_000);
  }

  async updateStorage() {
    this.storageData = await this.apiService.getStorageData();
  }

  async moveItems(data: ItemMoves) {
    await this.apiService.moveItems(data);

    setTimeout(() => {
      this.updateStorage();
    }, 3_000);
  }
}
