FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod

# Копируем dist, собранный на хосте
COPY dist ./dist

# Копируем Prisma schema
COPY prisma ./prisma

# Копируем env
COPY .env ./

CMD ["node", "dist/main.js"]
