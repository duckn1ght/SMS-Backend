# Используем официальный Node.js образ с Alpine Linux для минимального размера
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Стадия разработки и сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Финальная стадия - продакшен образ
FROM node:18-alpine AS production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Копируем production зависимости из base стадии
COPY --from=base /app/node_modules ./node_modules

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist

# Копируем package.json для метаинформации
COPY package*.json ./

# Меняем владельца файлов на созданного пользователя
RUN chown -R nestjs:nodejs /app
USER nestjs

# Открываем порт
EXPOSE 3000

# Команда запуска приложения
CMD ["node", "dist/main.js"]