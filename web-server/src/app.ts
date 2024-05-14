import * as fs from 'fs/promises';

import express, { Request, Response } from 'express';
import expressWs from 'express-ws';

const appWs = expressWs(express());
const app = appWs.app;

const port: number = 3000;

enum MessageTypeComputerToServer {
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
}

enum MessageTypeServerToComputer {
  FETCH_UPDATE = 'FETCH_UPDATE',
  MOVE_ITEMS = 'MOVE_ITEMS',
  INFO = 'INFO',
}

interface StorageInfo {
  name: string;
  metaData: StorageMetaData;

  itemStacks: ItemStack[];
}

interface StorageMetaData {
  size: number;
}

interface ItemStack {
  slot: number;

  name: string;
  count: number;
  nbtHash: string;

  itemDetails: ItemDetails | null;
}

interface ItemDetails {
  displayName: string;
  lore: string[] | null;
  durability: number | null;
  maxCount: number;
  maxDamage: number | null;
  enchantments: Enchantment[] | null;
  tags: string[];
}

interface Enchantment {
  displayName: string;
  level: number;
  name: string;
}

interface InventoryUpdate {
  storages: StorageInfo[];
}

interface ItemMove {
  /** storage name */
  from: string;
  /** storage name */
  to: string;

  fromSlot: number;
  toSlot: number | null;
}

interface ItemMoves {
  moves: ItemMove[];
}

interface MessageC2SStructure {
  type: MessageTypeComputerToServer;
  data: unknown;
}

interface MessageS2CStructure {
  type: MessageTypeServerToComputer;
  data: unknown;
}

interface MessageC2SInventoryUpdate extends MessageC2SStructure {
  type: MessageTypeComputerToServer.INVENTORY_UPDATE;
  data: InventoryUpdate;
}

interface MessageS2CFetchUpdate extends MessageS2CStructure {
  type: MessageTypeServerToComputer.FETCH_UPDATE;
  data: null;
}

interface MessageS2CInfo extends MessageS2CStructure {
  type: MessageTypeServerToComputer.INFO;
  data: string;
}

interface MessageS2CMoveItems extends MessageS2CStructure {
  type: MessageTypeServerToComputer.MOVE_ITEMS;
  data: ItemMoves;
}

type MessageC2S = MessageC2SInventoryUpdate;
type MessageS2C = MessageS2CFetchUpdate | MessageS2CInfo | MessageS2CMoveItems;

function isMessageC2S(message: MessageC2SStructure): message is MessageC2S {
  return Object.values(MessageTypeComputerToServer).includes(message.type);
}

app.ws('/ws', (ws, req) => {
  ws.on('message', (msg) => {
    const message: MessageC2SStructure = JSON.parse(msg.toString());

    if (!isMessageC2S(message)) {
      ws.send(
        JSON.stringify({
          type: MessageTypeServerToComputer.INFO,
          data: 'Invalid message type',
        }),
      );
    }

    if (message.type === MessageTypeComputerToServer.INVENTORY_UPDATE) {
      const data = message.data as InventoryUpdate;

      fs.writeFile('storage-data.json', JSON.stringify(data), 'utf-8');
    }
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript!');
});

app.get('/storageData', async (req: Request, res: Response) => {
  const data = await fs.readFile('storage-data.json', 'utf-8');
  res.json(JSON.parse(data));
});

app.get('/fetchUpdate', (req: Request, res: Response) => {
  // send message to all connected clients
  appWs.getWss().clients.forEach((client) => {
    const message: MessageS2CFetchUpdate = {
      type: MessageTypeServerToComputer.FETCH_UPDATE,
      data: null,
    };

    client.send(JSON.stringify(message));
  });

  res.json({ message: 'Sent fetch update to all clients' });
});

app.post('/moveItems', (req: Request, res: Response) => {
  const itemMoves: ItemMoves = req.body;

  appWs.getWss().clients.forEach((client) => {
    const message: MessageS2CMoveItems = {
      type: MessageTypeServerToComputer.MOVE_ITEMS,
      data: itemMoves,
    };

    client.send(JSON.stringify(message));
  });

  res.json({ message: 'Sent move items to all clients' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
