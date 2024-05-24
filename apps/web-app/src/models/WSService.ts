import {
  MessageTypeServerToClient,
  MessageTypeClientToServer,
  MessageC2SConnection,
  ConnectionType,
  MessageS2C,
  StorageSystemUpdate,
} from 'types';

export class WSService {
  constructor(public wsUrl: string) {
    this.connect();
  }

  ws: WebSocket | null = null;

  connect() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.addEventListener('open', () => {
      this.onConnect();
    });

    this.ws.addEventListener('message', (msg) => {
      this.onMessage(msg);
    });
  }

  onConnect() {
    this.ws?.send(
      JSON.stringify({
        type: MessageTypeClientToServer.CONNECTION,
        data: {
          name: Math.random().toString(36).substring(7),
          type: ConnectionType.WEB_APP,
        },
      } satisfies MessageC2SConnection),
    );
  }

  onMessage(msg: MessageEvent) {
    // console.log('Received message:', msg.data);

    const message: MessageS2C = JSON.parse(msg.data);

    if (message.type === MessageTypeServerToClient.INFO) {
      console.log('Server info:', message.data);
    }
  }

  addStorageSystemChangeListener(callback: (data: StorageSystemUpdate) => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (msg: any) => {
      const message: MessageS2C = JSON.parse(msg.data);

      if (message.type === MessageTypeServerToClient.STORAGE_SYSTEM_UPDATE) {
        callback(message.data);
      }
    };

    this.ws?.addEventListener('message', listener);

    return () => {
      this.ws?.removeEventListener('message', listener);
    };
  }
}
