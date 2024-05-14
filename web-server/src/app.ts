import * as fs from 'fs/promises';

import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import {
  InventoryUpdate,
  ItemMoves,
  MessageC2S,
  MessageC2SStructure,
  MessageS2CFetchUpdate,
  MessageS2CInfo,
  MessageS2CMoveItems,
  MessageTypeComputerToServer,
  MessageTypeServerToComputer,
} from './interfaces/types';

const appWs = expressWs(express());
const app = appWs.app;

const port: number = 3000;

function isMessageC2S(message: MessageC2SStructure): message is MessageC2S {
  return Object.values(MessageTypeComputerToServer).includes(message.type);
}

app.ws('/ws', (ws, req) => {
  console.log('Client connected');

  ws.addEventListener('close', () => {
    console.log('Client disconnected');
  });

  ws.on('message', async (msg) => {
    console.log('Received message:', msg.toString());

    try {
      const message: MessageC2SStructure = JSON.parse(msg.toString());

      if (!isMessageC2S(message)) {
        ws.send(
          JSON.stringify({
            type: MessageTypeServerToComputer.INFO,
            code: 400,
            data: 'Invalid message type',
          } satisfies MessageS2CInfo),
        );
      }

      if (message.type === MessageTypeComputerToServer.INVENTORY_UPDATE) {
        const data = message.data as InventoryUpdate;

        await fs.writeFile('storage-data.json', JSON.stringify(data), 'utf-8');

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
  res.json({ connectedClients: appWs.getWss().clients.size });
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
