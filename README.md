# PadelBooking

A complete Padel Booking solution with a Node.js/Express backend and a Vue.js dashboard.

## Project Structure

- `client/`: Vue.js Dashboard application
- `server/`: Node.js/Express API server
- `package.json`: Root orchestration scripts
- `Dockerfile`: Multi-stage build for production deployment

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker (optional, for containerization)
- PostgreSQL (for the database)

### Installation

Install dependencies for both client and server from the root directory:

```bash
npm install
npm run install:all
```

### Development

Run both client and server in development mode concurrently:

```bash
npm run dev
```

- Dashboard: http://localhost:5173
- API: http://localhost:4000

### Production Build

To build the client and start the server (which serves the client):

```bash
npm run build
npm start
```

- Application: http://localhost:4000

## Docker

Build the Docker image:

```bash
npm run docker:build
# OR
docker build -t padel-booking .
```

Run the container:

```bash
npm run docker:run
# OR
docker run -p 4000:4000 -e DATABASE_URL=... padel-booking
```

Ensure you provide the necessary environment variables (like `DATABASE_URL`) when running the container.
