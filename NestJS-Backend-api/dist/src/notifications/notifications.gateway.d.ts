import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Notification } from '@prisma/client';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        room: string;
    }): void;
    handleLeaveRoom(client: Socket, data: {
        room: string;
    }): void;
    sendNotificationToUser(userId: string, notification: Notification): void;
    sendNotificationToRole(role: string, notification: any): void;
    sendNotificationToCourse(courseId: string, notification: any): void;
    sendSystemAnnouncement(announcement: any): void;
    getConnectedUsersCount(): number;
    isUserOnline(userId: string): boolean;
    getOnlineUsers(): string[];
    handleTypingStart(client: Socket, data: {
        courseId: string;
        userName: string;
    }): void;
    handleTypingStop(client: Socket, data: {
        courseId: string;
        userName: string;
    }): void;
    sendRealTimeUpdate(room: string, updateType: string, data: any): void;
}
