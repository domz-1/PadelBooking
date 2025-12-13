# PadelBooking API

A comprehensive sports venue booking system refactored to a modular architecture using Node.js, Express, PostgreSQL, and Sequelize.

## 🚀 Features

- **Modular Architecture**: Organized by feature (Auth, Users, Venues, Bookings, etc.).
- **PostgreSQL & Sequelize**: Robust relational database with ORM.
- **Authentication**: JWT-based auth with role management (User/Admin).
- **Real-time Updates**: Socket.io for chat and notifications.
- **Bilingual Support**: English and Arabic support via `x-locale` header.
- **Dockerized**: Easy deployment with Docker Compose.
- **Swagger Documentation**: Interactive API docs.

## 📦 Modules

1.  **Auth**: Registration, Login, JWT management.
2.  **Users**: Profile management, image upload, bio.
3.  **Venues**: Venue management, filtering, pagination.
4.  **Bookings**: 
    - Standard bookings.
    - Academy bookings (Coach assignment).
    - Email confirmations.
5.  **Chat**: Real-time messaging between users/admins.
6.  **Settings**: 
    - Global configuration (Business name, Logo, Timezone).
    - Categories with color coding.
    - Admin Analysis Dashboard.
7.  **Sports**: Manage different sports types.
8.  **Coaches**: Coach profiles, packages, and ratings.
9.  **Matches**: Open matches, join requests (Friendly/Competitive).
10. **Offers**: Promotional offers management.
11. **Stories**: Temporary content (Images/Videos) expiring in 24h.
12. **Notifications**: Database-stored notifications + Real-time broadcasts.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Real-time**: Socket.io
- **Documentation**: Swagger UI
- **Containerization**: Docker

## 🏃‍♂️ Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (for local development)

### Using Docker (Recommended)

1.  Clone the repository.
2.  Create a `.env` file (see `.env.example` or below).
3.  Run:
    ```bash
    docker-compose up --build
    ```
4.  API will be available at `http://localhost:5000`.

### Local Development

1.  Install dependencies:
    ```bash
    yarn install
    ```
2.  Ensure PostgreSQL is running.
3.  Update `.env` with your DB credentials.
4.  Run:
    ```bash
    yarn dev
    ```

## 🔑 Environment Variables

```env
NODE_ENV=development
PORT=5000
API_BASE=/api/v1
DATABASE_URL=postgres://postgres:postgres@localhost:5432/padelbooking
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
FROM_NAME=PadelBooking
FROM_EMAIL=noreply@padelbooking.com
```

## 📚 API Documentation

Once the server is running, visit:
`http://localhost:5000/api-docs`