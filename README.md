# 🎾 PadelBooking

A premium, full-stack Padel Court Management and Booking solution. Features a high-performance **Next.js** frontend with a real-time **Node.js** backend, designed for seamless venue operations and a superior user experience.

---

## 🚀 Technical Stack

### **Frontend (Client)**
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4 + Shadcn UI (Radix UI primitives)
- **State Management:** Zustand
- **Real-time:** Socket.io-client
- **Forms:** React Hook Form + Zod Validation
- **Animations:** Framer Motion
- **Icons:** Lucide React

### **Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Cache/Session:** Redis
- **Real-time:** Socket.io
- **Security:** JWT, Bcrypt, Helmet, HPP, XSS-Clean
- **Logging:** Winston + Morgan
- **File Handling:** Multer + Sharp (Image optimization)

### **Orchestration**
- **Package Manager:** [Bun](https://bun.sh/)
- **Infrastructure:** Docker (for Database & Redis)

---

## ✨ Key Features

### **For Players**
- **Live Availability Board**: Real-time "Empty Slots" board on the landing page showing what's available tonight.
- **Interactive Booking Grid**: Seamlessly book slots across multiple branches and courts.
- **Waitlist System**: Join a queue for fully booked slots and get notified when they become available.
- **Order Tracking**: Manage and view your personal bookings and academy packages.
- **WhatsApp Integration**: Quick contact for support and booking confirmations.

### **For Administrators**
- **Management Dashboard**: Full control over venues, branches, and booking statuses.
- **Recurring Bookings**: Support for single and upcoming series updates for permanent bookings.
- **Academy Module**: Manage academy-specific schedules, packages, and students.
- **Financial Insights**: Detailed analytics on utilization, revenue, and popular time slots.
- **User Management**: Advanced user controls, including banning, activation, and role assignments.
- **Booking Logs**: Full audit trail for every booking action.
- **Branding Engine**: Dynamic configuration for brand colors, logos, and support numbers.

---

## 🛠️ Project Structure

```bash
├── client/          # Next.js Frontend
│   ├── app/         # App Router (Pages & API routes)
│   ├── components/  # Atomic UI & Business components
│   ├── hooks/       # Custom React hooks (Store, API, Auth)
│   └── lib/         # Utility functions (API client, Socket)
├── server/          # Node.js/Express Backend
│   ├── src/         # API source code (Routes, Controllers, Models)
│   ├── scripts/     # Maintenance & Seeding scripts
│   └── config/      # Database & Environment config
└── package.json     # Workspace management & Global scripts
```

---

## 🏁 Getting Started

### **Prerequisites**
- [Bun](https://bun.sh/) installed.
- Docker Desktop (for DB and Redis).

### **Setup & Installation**

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Environment Configuration**:
   Create `.env` files in both `client/` and `server/` based on their respective `.env.example` templates.

3. **Spin up Infrastructure**:
   ```bash
   bun run setup:all
   # This starts PostgreSQL and Redis via Docker
   ```

4. **Seed Database (Optional)**:
   ```bash
   bun run server seed
   ```

### **Running for Development**

Start both the client and server concurrently:
```bash
bun run dev:all
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Documentation**: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---

## 🚢 Deployment

The project is structured to be easily containerized and deployed.

```bash
# Production Build
bun run build
```

---

## 📄 License
Privately developed for Padel Management. All rights reserved.
