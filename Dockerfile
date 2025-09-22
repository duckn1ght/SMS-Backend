# backend
FROM node:22-alpine

WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
COPY ./package.json ./yarn.lock ./

RUN yarn install --frozen-lockfile

# Копируем остальные файлы проекта
COPY . .

RUN chmod +x ./wait-for-it.sh

RUN apk add --no-cache bash netcat-openbsd

RUN yarn build

ENV POSTGRES_HOST=postgres

EXPOSE 3000

CMD ["bash", "-c", "./wait-for-it.sh postgres:5432 -- yarn start:prod"]