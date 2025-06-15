# 📢 Event-Driven Notification System

An event-driven backend service built with **Express.js**, **TypeScript**, and **MongoDB** (via Mongoose) that allows users to subscribe to various events and receive notifications based on their preferences.

---

## 🧠 Features

### ✅ User Management
- Register new users.
- Define notification preferences by event type and delivery method (email, SMS, in-app).
- Update preferences anytime.

### ⚙️ Event Handling
- Create and manage events.
- Support for different priority levels:
  - **High**: triggers notifications immediately.
  - **Low**: batched and sent once daily.
- Events contain `type`, `priority`, `title`, `description`, and `createdAt`.

### 📬 Notification System
- Notify users based on their preferences and subscribed event types.
- Prevents duplicate notifications for the same event.
- Supports:
  - Immediate notification for high-priority events.
  - Batched daily delivery for low-priority events.
- Bulk notification API support.
- Notification retrieval with filtering options (type, priority, date).


## 🛠 Tech Stack

- **Backend:** Express.js with TypeScript
- **Database:** MongoDB + Mongoose
- **Scheduler:** node-cron for batching low-priority notifications
- **Logger:** Winston
- **Middleware:** Helmet, CORS, express-rate-limit

---

## 📦 Installation

```bash
# Clone the repository

(https://github.com/Gopika-velayudhan/Event-Driven-Notification.git)
cd event-driven

# Install dependencies
npm install

## 🚀 Usage

# Development Mode
npm run dev

# Build
npm run build





