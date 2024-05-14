"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const types_1 = require("./interfaces/types");
const appWs = (0, express_ws_1.default)((0, express_1.default)());
const app = appWs.app;
const port = 3000;
function isMessageC2S(message) {
    return Object.values(types_1.MessageTypeComputerToServer).includes(message.type);
}
app.ws('/ws', (ws, req) => {
    console.log('Client connected');
    ws.addEventListener('close', () => {
        console.log('Client disconnected');
    });
    ws.on('message', async (msg) => {
        console.log('Received message:', msg.toString());
        try {
            const message = JSON.parse(msg.toString());
            if (!isMessageC2S(message)) {
                ws.send(JSON.stringify({
                    type: types_1.MessageTypeServerToComputer.INFO,
                    code: 400,
                    data: 'Invalid message type',
                }));
            }
            if (message.type === types_1.MessageTypeComputerToServer.INVENTORY_UPDATE) {
                const data = message.data;
                await fs.writeFile('storage-data.json', JSON.stringify(data), 'utf-8');
                ws.send(JSON.stringify({
                    type: types_1.MessageTypeServerToComputer.INFO,
                    code: 200,
                    data: 'Inventory data updated',
                }));
            }
        }
        catch (e) {
            ws.send(JSON.stringify({
                type: types_1.MessageTypeServerToComputer.INFO,
                code: 400,
                data: 'Invalid message format, unable to parse JSON',
            }));
        }
    });
});
app.get('/', (req, res) => {
    res.send('Hello World with TypeScript!');
});
app.get('/connectionCount', (req, res) => {
    // send back the number of connected clients
    res.json({ connectedClients: appWs.getWss().clients.size });
});
app.get('/storageData', async (req, res) => {
    const data = await fs.readFile('storage-data.json', 'utf-8');
    res.json(JSON.parse(data));
});
app.get('/fetchUpdate', (req, res) => {
    // send message to all connected clients
    appWs.getWss().clients.forEach((client) => {
        const message = {
            type: types_1.MessageTypeServerToComputer.FETCH_UPDATE,
            data: null,
        };
        client.send(JSON.stringify(message));
    });
    res.json({ message: 'Sent fetch update to all clients' });
});
app.post('/moveItems', (req, res) => {
    const itemMoves = req.body;
    appWs.getWss().clients.forEach((client) => {
        const message = {
            type: types_1.MessageTypeServerToComputer.MOVE_ITEMS,
            data: itemMoves,
        };
        client.send(JSON.stringify(message));
    });
    res.json({ message: 'Sent move items to all clients' });
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
