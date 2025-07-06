# QUIZDOM Makefile
# Full-stack application with React frontend and FastAPI backend

.PHONY: help install dev test lint format clean build docker-build docker-run

# Default target
help: ## Show this help message
	@echo "QUIZDOM - Full Stack Application"
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ======================
# DEPENDENCY MANAGEMENT
# ======================

install: install-frontend install-backend ## Install all dependencies

install-frontend: ## Install frontend dependencies
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install

install-backend: ## Install backend dependencies
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

# ======================
# DEVELOPMENT
# ======================

dev: ## Start both frontend and backend development servers
	@echo "Starting development servers..."
	@echo "Frontend will be available at http://localhost:5173"
	@echo "Backend will be available at http://localhost:8000"
	@echo "Press Ctrl+C to stop all servers"
	@trap 'kill %1 %2 2>/dev/null || true' INT; \
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 & \
	cd frontend && pnpm dev & \
	wait

dev-frontend: ## Start only the frontend development server
	@echo "Starting frontend development server..."
	cd frontend && pnpm dev

dev-backend: ## Start only the backend development server
	@echo "Starting backend development server..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ======================
# TESTING
# ======================

test: test-frontend test-backend ## Run all tests

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd frontend && pnpm run test:all

test-frontend-watch: ## Run frontend tests in watch mode
	cd frontend && pnpm run test:watch

test-frontend-coverage: ## Run frontend tests with coverage
	cd frontend && pnpm run test:coverage

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd backend && pytest

test-backend-verbose: ## Run backend tests with verbose output
	cd backend && pytest -v

test-backend-coverage: ## Run backend tests with coverage
	cd backend && pytest --cov=app --cov-report=html --cov-report=term

# ======================
# CODE QUALITY
# ======================

lint: lint-frontend lint-backend ## Run linting for both frontend and backend

lint-frontend: ## Run frontend linting
	@echo "Linting frontend..."
	cd frontend && pnpm run lint:check

lint-frontend-fix: ## Fix frontend linting issues
	cd frontend && pnpm run lint:fix

lint-backend: ## Run backend linting
	@echo "Linting backend..."
	cd backend && flake8 .

format: format-frontend format-backend ## Format code for both frontend and backend

format-frontend: ## Format frontend code
	@echo "Formatting frontend code..."
	cd frontend && pnpm run format:fix

format-frontend-check: ## Check frontend code formatting
	cd frontend && pnpm run format:check

format-backend: ## Format backend code
	@echo "Formatting backend code..."
	cd backend && black .
	cd backend && isort .

format-backend-check: ## Check backend code formatting
	cd backend && black --check .
	cd backend && isort --check-only .

typecheck: ## Run TypeScript type checking
	@echo "Running TypeScript type checking..."
	cd frontend && pnpm run typecheck

# ======================
# DATABASE
# ======================

db-upgrade: ## Run database migrations
	@echo "Running database migrations..."
	cd backend && alembic upgrade head

db-downgrade: ## Rollback database migrations
	@echo "Rolling back database migrations..."
	cd backend && alembic downgrade -1

db-revision: ## Create a new database migration
	@echo "Creating new database migration..."
	@read -p "Enter migration message: " message; \
	cd backend && alembic revision --autogenerate -m "$$message"

db-history: ## Show database migration history
	cd backend && alembic history

db-backup: ## Create a database backup
	@echo "Creating database backup..."
	@mkdir -p backups
	@BACKUP_FILE="backups/quizdom_backup_$$(date +%Y%m%d_%H%M%S).sql"; \
	echo "Backing up to: $$BACKUP_FILE"; \
	PGPASSWORD=postgres pg_dump -h db -U postgres -d quizdom \
		--no-owner --no-privileges --clean --if-exists \
		-f "$$BACKUP_FILE" && \
	echo "✅ Database backup created: $$BACKUP_FILE"

db-restore: ## Restore database from backup
	@echo "Available backups:"
	@ls -la backups/*.sql 2>/dev/null || echo "No backups found"
	@echo ""
	@read -p "Enter backup filename (e.g., backups/quizdom_backup_20240101_120000.sql): " backup_file; \
	if [ -f "$$backup_file" ]; then \
		echo "⚠️  This will REPLACE ALL current database content!"; \
		read -p "Are you sure you want to restore from $$backup_file? (y/N): " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
			echo "Restoring from backup (this will replace all data)..."; \
			PGPASSWORD=postgres psql -h db -U postgres -d quizdom \
				--single-transaction --set ON_ERROR_STOP=on \
				-f "$$backup_file" && \
			echo "✅ Database restored successfully from $$backup_file"; \
		else \
			echo "Restore cancelled."; \
		fi; \
	else \
		echo "❌ Backup file not found: $$backup_file"; \
	fi

db-backup-list: ## List all available backups
	@echo "Available database backups:"
	@ls -lah backups/*.sql 2>/dev/null | awk '{print $$9 " (" $$5 ") - " $$6 " " $$7 " " $$8}' || echo "No backups found"

db-backup-clean: ## Remove old backups (keeps last 5)
	@echo "Cleaning up old backups (keeping last 5)..."
	@ls -t backups/quizdom_backup_*.sql 2>/dev/null | tail -n +6 | xargs -r rm -v && echo "✅ Old backups cleaned" || echo "No old backups to clean"

db-backup-and-seed: ## Create backup, then reset and seed database
	@echo "Creating backup before reset and seed..."
	$(MAKE) db-backup
	@echo ""
	@echo "Now proceeding with reset and seed..."
	$(MAKE) db-seed

db-seed: ## Reset database and seed with fresh data
	@echo "Resetting database and seeding with fresh data..."
	@echo "⚠️  This will DELETE ALL existing data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || exit 1
	@echo "Dropping all tables..."
	cd backend && alembic downgrade base
	@echo "Recreating database schema..."
	cd backend && alembic upgrade head
	@echo "Seeding database with users and roles..."
	cd backend && python -m app.db.seed
	@echo "Seeding database with quiz data..."
	cd backend && python -m app.db.seed_quiz_data
	@echo "✅ Database reset and seeding completed!"

# ======================
# BUILD
# ======================

build: build-frontend ## Build production assets

build-frontend: ## Build frontend for production
	@echo "Building frontend for production..."
	cd frontend && pnpm run build

# ======================
# DOCKER
# ======================

docker-build: docker-build-frontend docker-build-backend ## Build Docker images

docker-build-frontend: ## Build frontend Docker image
	@echo "Building frontend Docker image..."
	docker build -t quizdom-frontend ./frontend

docker-build-backend: ## Build backend Docker image
	@echo "Building backend Docker image..."
	docker build -t quizdom-backend ./backend

docker-run-frontend: ## Run frontend Docker container
	docker run -p 3000:3000 quizdom-frontend

docker-run-backend: ## Run backend Docker container
	docker run -p 8000:8000 quizdom-backend

# ======================
# UTILITIES
# ======================

clean: clean-frontend clean-backend ## Clean all build artifacts and dependencies

clean-frontend: ## Clean frontend build artifacts and dependencies
	@echo "Cleaning frontend..."
	rm -rf frontend/node_modules
	rm -rf frontend/build
	rm -rf frontend/dist
	rm -rf frontend/.coverage
	rm -rf frontend/playwright-report
	rm -rf frontend/test-results

clean-backend: ## Clean backend build artifacts and dependencies
	@echo "Cleaning backend..."
	find backend -type d -name "__pycache__" -delete
	find backend -type f -name "*.pyc" -delete
	rm -rf backend/.pytest_cache
	rm -rf backend/htmlcov
	rm -rf backend/.coverage

pre-commit-install: ## Install pre-commit hooks
	pre-commit install

pre-commit-run: ## Run pre-commit hooks on all files
	pre-commit run --all-files

setup: install pre-commit-install ## Setup the project for development
	@echo "Project setup complete!"
	@echo "Run 'make dev' to start development servers"

status: ## Show project status
	@echo "=== Project Status ==="
	@echo "Frontend dependencies:"
	@cd frontend && pnpm list --depth=0 2>/dev/null || echo "  No dependencies found"
	@echo ""
	@echo "Backend dependencies:"
	@cd backend && pip list 2>/dev/null | head -10 || echo "  No dependencies found"
	@echo ""
	@echo "Git status:"
	@git status --short || echo "  Not a git repository"
