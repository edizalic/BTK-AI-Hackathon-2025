import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Notification } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from auth header or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store socket connection
      client.data.userId = userId;
      
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId).push(client.id);

      // Join user to their personal room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error during client connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    
    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      const index = sockets.indexOf(client.id);
      
      if (index > -1) {
        sockets.splice(index, 1);
        
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string }
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string }
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      createdAt: notification.createdAt,
      metadata: notification.metadata,
    });

    this.logger.log(`Sent notification to user ${userId}: ${notification.title}`);
  }

  // Send notification to all users with specific role
  sendNotificationToRole(role: string, notification: any) {
    this.server.to(`role:${role}`).emit('notification', notification);
    this.logger.log(`Sent notification to role ${role}: ${notification.title}`);
  }

  // Send notification to course participants
  sendNotificationToCourse(courseId: string, notification: any) {
    this.server.to(`course:${courseId}`).emit('notification', notification);
    this.logger.log(`Sent notification to course ${courseId}: ${notification.title}`);
  }

  // Send system-wide announcement
  sendSystemAnnouncement(announcement: any) {
    this.server.emit('system-announcement', announcement);
    this.logger.log(`Sent system announcement: ${announcement.title}`);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Send typing indicator for course discussions
  @SubscribeMessage('typing-start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courseId: string; userName: string }
  ) {
    client.to(`course:${data.courseId}`).emit('user-typing', {
      userId: client.data.userId,
      userName: data.userName,
      typing: true,
    });
  }

  @SubscribeMessage('typing-stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courseId: string; userName: string }
  ) {
    client.to(`course:${data.courseId}`).emit('user-typing', {
      userId: client.data.userId,
      userName: data.userName,
      typing: false,
    });
  }

  // Send real-time updates for assignments, grades, etc.
  sendRealTimeUpdate(room: string, updateType: string, data: any) {
    this.server.to(room).emit('real-time-update', {
      type: updateType,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}