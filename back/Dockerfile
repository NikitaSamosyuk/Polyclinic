FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY prisma.config.ts ./

COPY src ./src
COPY prisma ./prisma

RUN pnpm install
RUN pnpm prisma generate
RUN pnpm build

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma db push && node dist/main.js"]