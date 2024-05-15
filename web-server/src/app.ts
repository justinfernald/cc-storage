import * as fs from 'fs/promises';

import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import {
  StorageSystemUpdate,
  ItemMoves,
  MessageC2S,
  MessageC2SStructure,
  MessageS2CFetchUpdate,
  MessageS2CInfo,
  MessageS2CMoveItems,
  MessageTypeComputerToServer,
  MessageTypeServerToComputer,
  StorageSystem,
} from './interfaces/types';
import { sleep } from './utils';

const appWs = expressWs(express());
const app = appWs.app;

const port: number = 3000;

function isMessageC2S(message: MessageC2SStructure): message is MessageC2S {
  return Object.values(MessageTypeComputerToServer).includes(message.type);
}

app.use(express.json());

// middleware to allow CORS
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.ws('/ws', (ws, req) => {
  console.log('Client connected');

  ws.addEventListener('close', () => {
    console.log('Client disconnected');
  });

  ws.on('message', async (msg) => {
    console.log('Received message:', msg.toString());

    try {
      const message: MessageC2S = JSON.parse(msg.toString());

      if (!isMessageC2S(message)) {
        ws.send(
          JSON.stringify({
            type: MessageTypeServerToComputer.INFO,
            code: 400,
            data: 'Invalid message type',
          } satisfies MessageS2CInfo),
        );
      }

      if (message.type === MessageTypeComputerToServer.PING) {
        ws.send(
          JSON.stringify({
            type: MessageTypeServerToComputer.PONG,
            data: null,
          }),
        );
      }

      if (message.type === MessageTypeComputerToServer.CONNECTION) {
        ws.send(
          JSON.stringify({
            type: MessageTypeServerToComputer.INFO,
            code: 200,
            data: 'Connection established',
          } satisfies MessageS2CInfo),
        );
      }

      if (message.type === MessageTypeComputerToServer.STORAGE_SYSTEM_UPDATE) {
        const data = message.data as StorageSystemUpdate;

        const systemName = data.storageSystem.name;

        // keep only alphanumeric characters
        const hashedSystemName = systemName.replace(/[^a-zA-Z0-9]/g, '');

        await fs.writeFile(
          `storage-systems-data/${hashedSystemName}.json`,
          JSON.stringify(data),
          'utf-8',
        );

        ws.send(
          JSON.stringify({
            type: MessageTypeServerToComputer.INFO,
            code: 200,
            data: 'Inventory data updated',
          } satisfies MessageS2CInfo),
        );
      }
    } catch (e) {
      ws.send(
        JSON.stringify({
          type: MessageTypeServerToComputer.INFO,
          code: 400,
          data: 'Invalid message format, unable to parse JSON',
        }),
      );
    }
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript!');
});

app.get('/connectionCount', (req: Request, res: Response) => {
  // send back the number of connected clients
  res.json({ count: appWs.getWss().clients.size });
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
  appWs.getWss().clients.forEach((client) => {
    const message: MessageS2CFetchUpdate = {
      type: MessageTypeServerToComputer.FETCH_UPDATE,
      data: null,
    };

    client.send(JSON.stringify(message));
  });
}

app.get('/fetchUpdate', async (req: Request, res: Response) => {
  // send message to all connected clients
  await fetchUpdate();

  res.json({ message: 'Sent fetch update to all clients' });
});

function moveItems(itemMoves: ItemMoves) {
  appWs.getWss().clients.forEach((client) => {
    const message: MessageS2CMoveItems = {
      type: MessageTypeServerToComputer.MOVE_ITEMS,
      data: itemMoves,
    };

    client.send(JSON.stringify(message));
  });
}

app.post('/moveItems', async (req: Request, res: Response) => {
  const itemMoves: ItemMoves = req.body;

  await moveItems(itemMoves);
  await sleep(2000);
  await fetchUpdate();

  res.json({ message: 'Sent move items to all clients' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
