rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f backend

migrate:
	docker compose exec backend pnpm prisma migrate deploy

ps:
	docker compose ps
