import * as fs from 'fs/promises';

import express, { Request, Response } from 'express';
import expressWs from 'express-ws';

import * as ws from 'ws';

import {
  ItemMovementPackage,
  MessageC2S,
  MessageC2SStructure,
  MessageS2CFetchUpdate,
  MessageS2CInfo,
  MessageS2CMoveItems,
  StorageSystem,
  ConnectionData,
  ConnectionType,
  MessageS2CPong,
  MessageS2CStorageSystemUpdate,
  MessageTypeServerToClient,
  StorageSystemUpdate,
  MessageTypeClientToServer,
  InventoryInfo,
} from './interfaces/types';
import { sleep } from './utils';
import { db } from './database/database';
import {
  storageTags,
  storageTagsRelations,
  storages,
  tags as tagsTable,
} from './database/schema';
import { eq } from 'drizzle-orm';

const appWs = expressWs(express());
const app = appWs.app;

const port: number = 3000;

function isMessageC2S(message: MessageC2SStructure): message is MessageC2S {
  return Object.values(MessageTypeClientToServer).includes(message.type);
}

app.use(express.json());

// middleware to allow CORS
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const connections: Map<string, { ws: ws; connectionData: ConnectionData }> = new Map();

app.ws('/ws', (ws) => {
  let name: string | null = null;
  console.log('Client connected');

  ws.addEventListener('close', () => {
    console.log('Client disconnected');

    if (name) {
      connections.delete(name);
    }
  });

  ws.on('message', async (msg) => {
    console.log('Received message:', msg.toString());

    try {
      const message: MessageC2S = JSON.parse(msg.toString());

      if (!isMessageC2S(message)) {
        ws.send(
          JSON.stringify({
            type: MessageTypeServerToClient.INFO,
            code: 400,
            data: 'Invalid message type',
          } satisfies MessageS2CInfo),
        );
      }

      if (message.type === MessageTypeClientToServer.PING) {
        ws.send(
          JSON.stringify({
            type: MessageTypeServerToClient.PONG,
            data: {
              id: message.data.time,
            },
          } satisfies MessageS2CPong),
        );
      }

      if (message.type === MessageTypeClientToServer.CONNECTION) {
        const data = message.data;

        name = data.name;

        connections.set(data.name, { ws, connectionData: data });

        ws.send(
          JSON.stringify({
            type: MessageTypeServerToClient.INFO,
            code: 200,
            data: 'Connection established',
          } satisfies MessageS2CInfo),
        );
      }

      if (message.type === MessageTypeClientToServer.STORAGE_SYSTEM_UPDATE) {
        const data = message.data;
        const systemName = data.storageSystem.name;

        // keep only alphanumeric characters
        const hashedSystemName = systemName.replace(/[^a-zA-Z0-9]/g, '');

        const fixedData: StorageSystem = {
          name: systemName,
          storages: data.storageSystem.storages.map((storage) => ({
            name: storage.name,
            metaData: storage.metaData,
            itemStacks: Array.isArray(storage.itemStacks)
              ? storage.itemStacks.map((itemStack) => ({
                  name: itemStack.name,
                  nbtHash: itemStack.nbtHash,
                  slot: itemStack.slot,
                  count: itemStack.count,
                  itemDetails: {
                    displayName: itemStack.itemDetails.displayName,
                    lore: itemStack.itemDetails.lore
                      ? Array.isArray(itemStack.itemDetails.lore)
                        ? itemStack.itemDetails.lore
                        : null
                      : null,
                    durability: itemStack.itemDetails.durability,
                    maxCount: itemStack.itemDetails.maxCount,
                    maxDamage: itemStack.itemDetails.maxDamage,
                    enchantments: itemStack.itemDetails.enchantments
                      ? Array.isArray(itemStack.itemDetails.enchantments)
                        ? itemStack.itemDetails.enchantments.map((enchantment) => ({
                            displayName: enchantment.displayName,
                            level: enchantment.level,
                            name: enchantment.name,
                          }))
                        : null
                      : null,
                    tags: itemStack.itemDetails.tags,
                  },
                }))
              : [],
          })),
        };

        await fs.writeFile(
          `storage-systems-data/${hashedSystemName}.json`,
          JSON.stringify(fixedData),
          'utf-8',
        );

        ws.send(
          JSON.stringify({
            type: MessageTypeServerToClient.INFO,
            code: 200,
            data: 'Inventory data updated',
          } satisfies MessageS2CInfo),
        );

        updateClients({ updateTime: data.updateTime, storageSystem: fixedData });
      }
    } catch (e) {
      ws.send(
        JSON.stringify({
          type: MessageTypeServerToClient.INFO,
          code: 400,
          data: 'Invalid message format, unable to parse JSON',
        }),
      );
    }
  });
});

function updateClients(storageSystemUpdate: StorageSystemUpdate) {
  const connectionsData = Array.from(connections.values()).map(
    (connection) => connection.connectionData,
  );

  const filteredConnections = connectionsData.filter(
    (connectionData) => connectionData.type === ConnectionType.WEB_APP,
  );

  filteredConnections.forEach((connectionData) => {
    const connection = connections.get(connectionData.name);

    if (connection) {
      const message: MessageS2CStorageSystemUpdate = {
        type: MessageTypeServerToClient.STORAGE_SYSTEM_UPDATE,
        data: storageSystemUpdate,
      };

      connection.ws.send(JSON.stringify(message));
    }
  });
}

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript!');
});

app.get('/connectedComputers', (req: Request, res: Response) => {
  // send back the number of connected clients
  const connectionsData = Array.from(connections.values()).map(
    (connection) => connection.connectionData,
  );

  const filteredConnections = connectionsData.filter(
    (connectionData) => connectionData.type === ConnectionType.COMPUTER,
  );

  res.json({
    connections: filteredConnections,
  });
});

app.get('/storageData', async (req: Request, res: Response) => {
  const data = await fs.readFile('storage-data.json', 'utf-8');
  res.json(JSON.parse(data));
});

app.get('/storageSystems', async (req: Request, res: Response) => {
  const files = await fs.readdir('storage-systems-data');
  const data: StorageSystem[] = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(`storage-systems-data/${file}`, 'utf-8');
      return JSON.parse(content);
    }),
  );

  res.json(data);
});

app.get('/storageSystems/:name', async (req: Request, res: Response) => {
  const name = req.params.name;
  const hashedName = name.replace(/[^a-zA-Z0-9]/g, '');

  try {
    const data = await fs.readFile(`storage-systems-data/${hashedName}.json`, 'utf-8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(404).json({ message: 'Storage system not found' });
  }
});

function fetchUpdate() {
  const connectionsData = Array.from(connections.values()).map(
    (connection) => connection.connectionData,
  );

  const filteredConnections = connectionsData.filter(
    (connectionData) => connectionData.type === ConnectionType.WEB_APP,
  );

  filteredConnections.forEach((connectionData) => {
    const connection = connections.get(connectionData.name);

    if (connection) {
      const message: MessageS2CFetchUpdate = {
        type: MessageTypeServerToClient.FETCH_UPDATE,
        data: null,
      };

      connection.ws.send(JSON.stringify(message));
    }
  });
}

app.get('/fetchUpdate', async (req: Request, res: Response) => {
  // send message to all connected clients
  await fetchUpdate();

  res.json({ message: 'Sent fetch update to all clients' });
});

function moveItems(itemMoves: ItemMovementPackage) {
  const connectionsData = Array.from(connections.values()).map(
    (connection) => connection.connectionData,
  );

  const computer = connectionsData.find(
    (connectionData) =>
      connectionData.type === ConnectionType.COMPUTER &&
      connectionData.name === itemMoves.systemName,
  );

  if (computer) {
    const connection = connections.get(computer.name);

    if (connection) {
      const message: MessageS2CMoveItems = {
        type: MessageTypeServerToClient.MOVE_ITEMS,
        data: itemMoves,
      };

      connection.ws.send(JSON.stringify(message));
    }
  }
}

app.post('/moveItems', async (req: Request, res: Response) => {
  const itemMoves: ItemMovementPackage = req.body;

  await moveItems(itemMoves);
  await sleep(2000);
  await fetchUpdate();

  res.json({ message: 'Sent move items to all clients' });
});

// used to set the inventory info for a specific inventory
app.post('/inventoryInfo', async (req: Request, res: Response) => {
  const data: InventoryInfo = req.body;

  const { name, tags, ...updatedData } = data;

  await db.transaction(async (tx) => {
    console.log('a');
    await tx.insert(tagsTable).values(tags).onConflictDoNothing().execute();

    const tagIds = await tx.query.tags.findMany({
      where: (tag, { inArray }) =>
        inArray(
          tag.name,
          tags.map((tag) => tag.name),
        ),
    });

    console.log('b');
    // insert or update the inventory info in the db
    const [storageId] = await tx
      .insert(storages)
      .values({
        name,
        ...updatedData,
      })
      .onConflictDoUpdate({ target: [storages.name], set: updatedData })
      .returning({ id: storages.id });

    console.log('c');
    await tx.delete(storageTags).where(eq(storageTags.storageId, storageId.id)).execute();

    console.log('d');
    if (tagIds.length > 0) {
      await tx
        .insert(storageTags)
        .values(tagIds.map((tag) => ({ storageId: storageId.id, tagId: tag.id })))
        .execute();
    }

    console.log('e');
  });

  res.json({ message: 'Inventory info updated' });
});

app.get('/inventoryInfo/:name', async (req: Request, res: Response) => {
  const name = req.params.name;

  // const [data] = await db
  //   .select()
  //   .from(storages)
  //   .where(eq(storages.name, name))
  //   .execute();

  const data = await db.query.storages.findFirst({
    where: (storage, { eq }) => eq(storage.name, name),
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!data) {
    res.status(404).json({ message: 'Inventory info not found' });
    return;
  }

  res.json(data);
  // res.json(data satisfies InventoryInfo);
});

app.get('/inventoryInfo', async (_req: Request, res: Response) => {
  // const data: InventoryInfo[] = await db.select().from(storages).execute();
  const data = await db.query.storages.findMany({
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
