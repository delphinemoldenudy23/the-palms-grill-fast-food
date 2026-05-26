# The Palm's Grill & Fast Food - Setup Guide

## Project Structure

```
the-palms-grill-fast-food/
├── frontend/           # Customer-facing website (Next.js)
├── backend/            # API server (Node.js/Express)
├── admin/              # Admin dashboard (Next.js)
└── docs/               # Documentation
```

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/palms-grill
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser: http://localhost:3000

### Admin Dashboard Setup

1. Navigate to admin directory:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser: http://localhost:3001

## API Endpoints (Coming Soon)

### Menu Items
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create admin account

## Features

### Frontend
- Modern, responsive design
- Online ordering system
- Menu browsing
- Contact & delivery information
- Social media links
- WhatsApp integration

### Admin Dashboard
- Login authentication
- Menu management
- Order tracking
- Price updates
- Image uploads
- Statistics dashboard

### Backend API
- RESTful API
- MongoDB integration
- JWT authentication
- Image upload (Cloudinary)
- Order management
- Menu management

## Database Schema

### MenuItem
```javascript
{
  name: String,
  description: String,
  category: String,
  prices: Map<String, Number>,
  image: String,
  available: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  customerName: String,
  customerPhone: String,
  items: Array,
  totalAmount: Number,
  status: String,
  deliveryType: String,
  createdAt: Date
}
```

### Admin
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  createdAt: Date
}
```

## Deployment

Coming soon...

## Support

For questions or issues, contact:
- Phone: 0551720664, 0548270547
- WhatsApp: palms.grill.fast
