FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN pnpm prisma generate

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY src ./src

RUN pnpm build

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma db push && node dist/main.js"]
