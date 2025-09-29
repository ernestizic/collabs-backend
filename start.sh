#!/usr/bin/env bash
# start.sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations applied. Starting application..."
npm run start:prod
