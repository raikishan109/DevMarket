# Developer Marketplace Platform

A production-ready marketplace where developers can sell their Tools, AI Automation tools, Websites, and Mobile Apps.

## Features

### For Buyers
- Browse and search products by category
- View detailed product information
- Secure payment via Razorpay
- Access purchased products
- Leave reviews and ratings

### For Developers
- List products for sale
- Manage product listings
- Track sales and earnings
- View analytics

### For Admins
- Approve/reject products
- Verify developers
- Set commission rates
- Monitor platform earnings
- Handle reports and refunds

## Tech Stack

**Frontend:**
- Next.js (React)
- Tailwind CSS
- Axios for API calls

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Razorpay Payment Gateway

## Project Structure

```
dev-marketplace/
├── frontend/          # Next.js application
├── backend/           # Express.js API
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Razorpay account (test mode)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see backend/.env.example)

4. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (see frontend/.env.example)

4. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Default Admin Credentials

**Email:** admin@devmarket.com  
**Password:** admin123

## Environment Variables

See `.env.example` files in both frontend and backend directories.

## API Documentation

API endpoints are documented in `backend/API.md`

## License

MIT
