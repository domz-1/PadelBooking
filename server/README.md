# PadelBooking API

A comprehensive sports venue booking system refactored to a modular architecture using Node.js, Express, PostgreSQL, and Sequelize.

## 🚀 Features

- **Modular Architecture**: Organized by feature (Auth, Users, Venues, Bookings, etc.).
- **PostgreSQL & Sequelize**: Robust relational database with ORM.
- **Authentication**: JWT-based auth with role management (User/Admin).
- **Real-time Updates**: Socket.io for chat and notifications.
- **Bilingual Support**: English and Arabic support via `x-locale` header.
- **Dockerized**: Easy deployment with Docker Compose.
- **Swagger Documentation**: Interactive API docs available at `/api-docs`.

## 📦 Core Modules

### 1. Authentication (`/auth`)
- **User Registration**: Sign up new users.
- **Login**: Authenticate users and issue JWT tokens.
- **Profile**: Retrieve current user details (`/me`).

### 2. Users (`/users`)
- **User Management**: View and manage user profiles.
- **Partner Search**: Find other players to play with based on skill level or preferences.

### 3. Venues (`/venues`)
- **Venue Listings**: Browse available padel venues.
- **Management**: Create, update, and delete venue details (Admin).
- **Search**: Filter venues by location, price, etc.

### 4. Bookings (`/bookings`)
- **Court Reservation**: Book courts for specific dates and times.
- **Waitlist**: Join a waitlist for fully booked slots.
- **My Bookings**: View personal booking history.
- **Booking Logs**: (New) Admin-only feature to view logs of all booking operations (creation, updates) with pagination and filtering.
- **Daily Summary**: (New) Admin endpoint to get a financial and operational summary of the "business day" (12 PM - 5 AM).
- **Import**: Bulk import bookings.

### 5. Matches (`/matches`)
- **Matchmaking**: Create and find matches.
- **Join Requests**: Request to join existing matches.
- **Management**: Handle join requests and match details.

### 6. Coaches (`/coaches`)
- **Coach Profiles**: Users can register as coaches.
- **Packages**: Coaches can offer training packages.
- **Booking**: Users can book sessions with coaches (integrated with bookings).

### 7. Store (`/store`)
- **Products**: Browse and manage padel-related products.
- **Orders**: Place and track orders for equipment or merchandise.

### 8. Sponsors (`/sponsors`) - *New Feature*
- **Management**: Admin can manage sponsors.
- **Details**: Each sponsor has a name, image, link, and active status.
- **API**: Full CRUD endpoints to list, create, update, and delete sponsors.

### 9. Social & Community
- **Chat (`/chat`)**: Real-time messaging between users.
- **Stories (`/stories`)**: Users can share stories/posts (similar to social media).
- **Notifications (`/notifications`)**: System and user notifications (broadcasts, read status).

### 10. System & Configuration
- **Settings (`/settings`)**: System-wide configurations and analysis.
- **Sports (`/sports`)**: Manage supported sports types (e.g., Padel, Tennis).
- **Offers (`/offers`)**: Manage promotional offers and discounts.

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