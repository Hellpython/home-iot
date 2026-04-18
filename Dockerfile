# 1. 빌드 단계 (Build Stage)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 단계 (Run Stage)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# SQLite/Postgres DB 관련 볼륨
VOLUME ["/app/data"]

EXPOSE 3001
# npm 대신 node를 직접 실행하여 SIGTERM 신호를 올바르게 수신함
CMD ["node", "dist/main.js"]
