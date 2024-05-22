import {
  StorageSystem,
  ItemMovementPackage,
  InventoryInfo,
} from '@cc-storage/common/src/types/types';

export class APIService {
  constructor(public rootUrl: string) {}

  async fetchUpdate(): Promise<boolean> {
    const result = await fetch(`${this.rootUrl}/fetchUpdate`);

    return result.status === 200;
  }

  async getStorageSystemCollection(): Promise<StorageSystem[]> {
    return await fetch(`${this.rootUrl}/storageSystems`).then((res) => res.json());
  }

  async getStorageSystem(name: string): Promise<StorageSystem[]> {
    return await fetch(`${this.rootUrl}/storageSystems/${name}`).then((res) =>
      res.json(),
    );
  }

  async getConnectionCount(): Promise<number> {
    const result = await fetch(`${this.rootUrl}/connectionCount`).then((res) =>
      res.json(),
    );

    return result.count;
  }

  async moveItems(data: ItemMovementPackage): Promise<boolean> {
    const result = await fetch(`${this.rootUrl}/moveItems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // check if result has status 200
    return result.status === 200;
  }

  async getInventoryInfo(name: string): Promise<InventoryInfo> {
    return await fetch(`${this.rootUrl}/inventoryInfo/${name}`).then((res) => res.json());
  }

  async getInventoryInfoCollection(): Promise<InventoryInfo[]> {
    return await fetch(`${this.rootUrl}/inventoryInfo`).then((res) => res.json());
  }

  async postInventoryInfo(data: InventoryInfo): Promise<boolean> {
    const result = await fetch(`${this.rootUrl}/inventoryInfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return result.status === 200;
  }
}
