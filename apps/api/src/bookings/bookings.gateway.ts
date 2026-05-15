import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/bookings' })
export class BookingsGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('join-booking')
  handleJoin(@MessageBody() bookingId: string, @ConnectedSocket() client: Socket) {
    client.join(`booking:${bookingId}`)
  }

  emitLocationUpdate(bookingId: string, location: { lat: number; lng: number }) {
    this.server.to(`booking:${bookingId}`).emit('location-update', location)
  }

  emitStepUpdate(bookingId: string, step: string) {
    this.server.to(`booking:${bookingId}`).emit('step-update', { step })
  }
}
