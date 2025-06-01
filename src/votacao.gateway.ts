import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  path: '/socket.io',           // ← DEVE bater com o Nginx
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class VotacaoGateway {
  @WebSocketServer()
  server: Server;

  // evento teste
  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }
}
