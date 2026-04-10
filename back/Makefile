up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

logs:
	docker compose logs -f backend

db:
	docker compose logs -f postgres

build:
	docker compose build

migrate:
	docker compose exec backend npx prisma migrate dev

generate:
	docker compose exec backend npx prisma generate

bash:
	docker compose exec backend sh

ps:
	docker compose ps
