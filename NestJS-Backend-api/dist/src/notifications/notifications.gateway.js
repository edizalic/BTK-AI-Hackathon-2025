"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
        this.userSockets = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.query?.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            client.data.userId = userId;
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, []);
            }
            this.userSockets.get(userId).push(client.id);
            client.join(`user:${userId}`);
            this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
        }
        catch (error) {
            this.logger.error('Error during client connection:', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
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
    handleJoinRoom(client, data) {
        client.join(data.room);
        this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    }
    handleLeaveRoom(client, data) {
        client.leave(data.room);
        this.logger.log(`Client ${client.id} left room: ${data.room}`);
    }
    sendNotificationToUser(userId, notification) {
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
    sendNotificationToRole(role, notification) {
        this.server.to(`role:${role}`).emit('notification', notification);
        this.logger.log(`Sent notification to role ${role}: ${notification.title}`);
    }
    sendNotificationToCourse(courseId, notification) {
        this.server.to(`course:${courseId}`).emit('notification', notification);
        this.logger.log(`Sent notification to course ${courseId}: ${notification.title}`);
    }
    sendSystemAnnouncement(announcement) {
        this.server.emit('system-announcement', announcement);
        this.logger.log(`Sent system announcement: ${announcement.title}`);
    }
    getConnectedUsersCount() {
        return this.userSockets.size;
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    getOnlineUsers() {
        return Array.from(this.userSockets.keys());
    }
    handleTypingStart(client, data) {
        client.to(`course:${data.courseId}`).emit('user-typing', {
            userId: client.data.userId,
            userName: data.userName,
            typing: true,
        });
    }
    handleTypingStop(client, data) {
        client.to(`course:${data.courseId}`).emit('user-typing', {
            userId: client.data.userId,
            userName: data.userName,
            typing: false,
        });
    }
    sendRealTimeUpdate(room, updateType, data) {
        this.server.to(room).emit('real-time-update', {
            type: updateType,
            data,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing-start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing-stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleTypingStop", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationGateway);
//# sourceMappingURL=notifications.gateway.js.map