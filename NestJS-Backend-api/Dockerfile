# Multi-stage Dockerfile for NestJS Education Management System

FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm ci --only=development && npm cache clean --force
COPY . .
RUN npx prisma generate
EXPOSE 3001
USER node
CMD ["dumb-init", "npm", "run", "start:dev"]

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci --only=development && npm cache clean --force
COPY . .
RUN npx prisma generate
RUN npm run build && npm prune --production

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma
RUN mkdir -p uploads && chown -R node:node uploads
EXPOSE 3001
USER node
CMD ["dumb-init", "node", "dist/main"]