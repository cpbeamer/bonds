#!/bin/bash

echo "Starting BondScout production services..."

# Load environment variables
export NODE_ENV=production
export USE_MOCK_FINRA_DATA=false

# Ensure logs directory exists
mkdir -p logs

# Start the FINRA scheduler with PM2
echo "Starting FINRA scheduler..."
npx pm2 start ecosystem.config.js

# Start the Next.js application
echo "Starting Next.js application..."
npm run build
npx pm2 start npm --name "bondscout-app" -- start

echo "All services started successfully!"
echo "Use 'npx pm2 status' to check service status"
echo "Use 'npx pm2 logs' to view logs"