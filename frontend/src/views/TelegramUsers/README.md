# Telegram Users Dashboard

This directory contains the frontend components for managing Telegram users in the Luxan e-commerce admin frontend.

## Components

### Main Dashboard
- **TelegramUsers.vue** - Main frontend page with statistics, user table, and management features

### Modals
- **AddTelegramUserModal.vue** - Create new Telegram users
- **EditTelegramUserModal.vue** - Edit existing user information
- **ViewTelegramUserModal.vue** - View detailed user information and quick actions
- **TestMessageModal.vue** - Send test messages to users
- **BulkUpdateModal.vue** - Bulk activate/deactivate multiple users

## Features

### 📊 **Statistics Dashboard**
- Total users count
- Activated vs deactivated users
- Activation rate percentage
- Recent users (last 7 days)

### 🔍 **Search & Filtering**
- Search by name, chat ID, username
- Filter by activation status
- Tabbed view (All, Activated, Deactivated)
- Pagination support

### 👥 **User Management**
- Create new users manually
- Edit user information
- Toggle activation status
- Bulk operations on multiple users
- Delete users with confirmation

### 📤 **Messaging Features**
- Send test messages to individual users
- Send test messages to all activated users
- Message delivery status tracking
- HTML formatting support

### 📋 **User Information**
- Basic info (name, chat ID, username)
- Telegram details (first/last name, language)
- Activity statistics (message count, last message)
- Admin notes
- Activation history

## API Integration

Uses the `TelegramUsersAPI` service for all backend communication:
- CRUD operations
- Statistics retrieval
- Test messaging
- Bulk updates
- User synchronization

## Routing

Accessible at `/telegram-users` in the admin frontend.

## Styling

- Responsive design with Tailwind CSS
- Dark mode support
- Consistent with existing admin frontend theme
- Interactive elements with hover states
- Loading states and animations

## Usage

1. Navigate to "Telegram Users" in the admin menu
2. View statistics and user list
3. Use search/filters to find specific users
4. Perform actions via buttons or table actions
5. Use modals for detailed operations

## Dependencies

- Vue 3 Composition API
- TypeScript
- Tailwind CSS
- Existing admin frontend components (DataTable, AdminLayout, etc.)
