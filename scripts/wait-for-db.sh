#!/bin/bash

# Wait for PostgreSQL to be ready
echo "🔄 Waiting for PostgreSQL to be ready..."

# Try using nc (netcat) first
if command -v nc &> /dev/null; then
    while ! nc -z localhost 5432; do
        sleep 1
        echo "🕒 Waiting for PostgreSQL..."
    done
    echo "✅ PostgreSQL is ready!"
else
    # Fallback method using curl if nc is not available
    echo "⚠️  nc not found, using alternative method..."
    MAX_ATTEMPTS=30
    ATTEMPT=1
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            echo "✅ PostgreSQL is ready!"
            exit 0
        fi
        sleep 1
        echo "🕒 Waiting for PostgreSQL... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
        ATTEMPT=$((ATTEMPT + 1))
    done
    
    echo "❌ PostgreSQL did not become ready in time"
    exit 1
fi