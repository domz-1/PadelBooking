# Stage 1: Build the Vue client
FROM node:20-alpine as client-build

WORKDIR /app/client

# Copy client package files
COPY client/package.json client/yarn.lock ./

# Install client dependencies
RUN yarn install

# Copy client source code
COPY client/ .

# Build the client
RUN yarn build-only

# Stage 2: Setup the Node.js server
FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package.json server/yarn.lock ./

# Install server dependencies
RUN yarn install --production

# Copy server source code
COPY server/src ./src
COPY server/.env.example ./.env

# Create public directory
RUN mkdir -p public

# Copy built client assets from Stage 1 to server's public directory
COPY --from=client-build /app/client/dist ./public

# Expose the port the server runs on
EXPOSE 4000

# Start the server
CMD ["node", "src/server.js"]
