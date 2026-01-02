# PadelBooking System Documentation

## 1. Backend Features (`server`)

The backend is an Express.js application providing a REST API and Real-time features (Socket.io).

### Core Modules

#### **Authentication (`/auth`)**
- **Register**: Create new user accounts (`POST /register`).
- **Login**: Authenticate users and receive JWT (`POST /login`).
- **Me**: Get current user profile (`GET /me`).
- **Logout**: Invalidate session (`POST /logout`).

#### **Bookings (`/bookings`)**
- **Create**: Book a court (`POST /`).
- **Read**: Get all bookings (Admin), My Bookings (User), or specific ID (`GET /`, `GET /my-bookings`, `GET /:id`).
- **Update/Delete**: Modify or cancel bookings (`PUT /:id`, `DELETE /:id`).
- **Waitlist**: Join/Leave waitlist for slots (`POST /waitlist`, `DELETE /waitlist/:id`).
- **Import**: Bulk import bookings via file (Admin) (`POST /import`).
- **Daily Summary**: Key metrics for the day (`GET /daily-summary`).
- **Logs**: History of booking actions (`GET /logs`).

#### **Other Modules**
- **Coaches**: Manage coach profiles and availability.
- **Matches**: Organize and view matches.
- **Notifications**: User notifications.
- **Offers**: Promotional offers management.
- **Settings**: System configuration.
- **Sponsors**: Sponsor management.
- **Sports**: Padel and potentially other sports.
- **Store**: E-commerce features (Products, Categories, Orders).
- **Stories**: Social stories/updates.
- **Users**: User management (Admin).
- **Venues**: Court/Venue management.

## 2. Admin Dashboard (`client`)

The Admin Dashboard is a Vue.js application running on `http://localhost:5176/admin/` (or similar port).

### Key Features
- **Dashboard**: Overview of sales, bookings (`Ecommerce`, `Home`).
- **Bookings Management**: View grid, manage bookings, waitlists.
- **E-commerce**:
    - **Products**: Manage inventory.
    - **Categories**: Organize products.
    - **Orders**: View and process user orders.
    - **Coupons**: Manage discounts.
- **User Management**:
    - **Users**: List and manage users.
    - **Coaches**: Manage coaches.
    - **TelegramUsers**: Integration with Telegram users.
- **Content Management**:
    - **Stories**: Manage app stories.
    - **Sponsors**: Manage sponsors.
    - **Offers**: Manage promotions.
- **System**:
    - **Settings**: Global settings.
    - **Venues**: Configure courts and venues.

## 3. Client Booking Web App (Next.js)

*Under Construction.*
This project (`booking-web`) is intended to be the public-facing website for users to:
- View venues and availability.
- Make bookings.
- Manage their profile and history.

### Setup
The project is initialized with Next.js (App Router), TypeScript, and Tailwind CSS.
