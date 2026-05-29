# Order Tracking & Real-Time Notifications Setup Guide

This document provides setup instructions for the new persistent order tracking and admin notification system.

## What's New

### Backend Changes
- **Order Schema Updated**: Added tracking fields (status history, notification flags, customer email, deletion tracking, timestamps)
- **Socket.IO Server**: Real-time WebSocket server for instant order updates
- **Order Routes Enhanced**: 
  - Status update API with history tracking
  - Customer orders endpoint (`GET /api/orders/customer/:phone`)
  - Soft delete for customer orders
  - Socket.IO event emissions for new orders and status updates

### Frontend Changes (Customer App)
- **My Orders Page**: New page at `/my-orders` for customers to track their orders
- **Order Tracking Component**: Visual status badges and timeline
- **Socket.IO Client**: Real-time order status updates
- **CartDrawer Updated**: Added email field and saves phone to localStorage
- **Header Updated**: Added "My Orders" link

### Admin Dashboard Changes
- **Notification Bell**: Real-time new order notifications with sound
- **Socket.IO Integration**: Auto-joins admin room for order updates
- **Order Status Management**: Updated dropdown with "Out for Delivery" option
- **Toast Notifications**: React Hot Toast for new order alerts

## Installation Steps

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Admin Dashboard:**
```bash
cd admin
npm install
```

### 2. Add Notification Sound File

The admin dashboard needs a notification sound file. Add a short bell sound to:

```
admin/public/notification.mp3
```

You can use any short notification sound (1-2 seconds). If you don't have one, the notification will still work visually (toast + badge) but won't play sound.

### 3. Start the Services

**Start Backend (with Socket.IO):**
```bash
cd backend
npm start
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Start Admin Dashboard:**
```bash
cd admin
npm run dev
```

### 4. Environment Configuration

Ensure your `.env` files are configured correctly:

**Backend (.env):**
```
MONGO_URI=mongodb://127.0.0.1:27017/palms-grill
PORT=5000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Admin (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## How It Works

### Customer Order Flow

1. **Place Order**: Customer fills cart and places order
2. **Phone Saved**: Customer phone is saved to localStorage
3. **Order Created**: Order saved to MongoDB with status "pending"
4. **Socket.IO Event**: Backend emits "new-order" to admin room
5. **Admin Notified**: Admin sees notification bell + toast + sound

### Admin Order Management

1. **View Orders**: Admin sees all orders in Orders tab
2. **Update Status**: Admin changes status via dropdown
3. **Socket.IO Event**: Backend emits "order-updated" to customer room
4. **Customer Updated**: Customer sees real-time status change on My Orders page

### Customer Order Tracking

1. **Access My Orders**: Click "My Orders" in header
2. **View Status**: See current status with visual timeline
3. **Real-time Updates**: Status updates automatically without refresh
4. **Delete Orders**: Customers can delete their own orders

## Order Status Flow

```
Pending → Confirmed → Preparing → Out for Delivery → Delivered
                                              ↓
                                          Cancelled
```

## API Endpoints

### Order Routes
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/customer/:phone` - Get customer orders
- `PATCH /api/orders/:id` - Update order status/payment
- `DELETE /api/orders/:id` - Soft delete order (customer only)

### Socket.IO Events

**Client → Server:**
- `join-admin` - Join admin notification room
- `join-customer` - Join customer room (by phone)

**Server → Client:**
- `new-order` - New order received (admin)
- `order-updated` - Order status changed (customer + admin)

## Troubleshooting

### Socket.IO Not Connecting
- Check that backend is running on port 5000
- Verify CORS origins include frontend and admin URLs
- Check browser console for connection errors

### Orders Not Saving
- Verify MongoDB is running
- Check backend logs for errors
- Ensure Order schema is updated (restart backend after schema changes)

### Notifications Not Working
- Check that Socket.IO client is initialized
- Verify admin joined the admin room (check console logs)
- Ensure notification sound file exists in admin/public/

### My Orders Page Empty
- Check that customer phone is saved in localStorage
- Verify customer orders endpoint is working
- Check that orders are not soft-deleted

## Deployment Notes

### Render (Backend)
- Socket.IO works with Render's websockets
- Ensure CORS origins include your production URLs
- No additional configuration needed

### Vercel (Frontend/Admin)
- Socket.IO client connects to backend URL
- Set NEXT_PUBLIC_API_URL to production backend URL
- No additional configuration needed

## Testing the Complete Flow

1. **Start all services** (backend, frontend, admin)
2. **Place an order** from frontend
3. **Check admin dashboard** - should see notification bell + toast
4. **Update order status** in admin
5. **Check My Orders page** - should see real-time status update
6. **Test deletion** - customer can delete their own orders

## Files Modified/Created

### Backend
- `models/Order.js` - Updated schema with tracking fields
- `server.js` - Added Socket.IO server
- `routes/orderRoutes.js` - Enhanced with status history and Socket.IO events
- `package.json` - Added socket.io dependency

### Frontend
- `lib/socket.js` - Socket.IO client utility (new)
- `lib/getApiUrl.js` - Updated to detect localhost
- `components/OrderTracking.jsx` - Order tracking component (new)
- `components/CartDrawer.jsx` - Added email field, saves phone to localStorage
- `components/Header.jsx` - Added "My Orders" link
- `pages/my-orders.jsx` - Customer orders page (new)
- `package.json` - Added socket.io-client dependency

### Admin
- `lib/socket.js` - Socket.IO client utility (new)
- `components/NotificationBell.jsx` - Notification bell component (new)
- `pages/dashboard.jsx` - Integrated Socket.IO and notification bell
- `public/notification.mp3` - Notification sound file placeholder (new)
- `package.json` - Added socket.io-client dependency

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal logs
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Check environment variables

## Next Steps

After setup:
1. Add a real notification sound file to `admin/public/notification.mp3`
2. Test the complete order flow
3. Customize the order tracking UI if needed
4. Adjust notification sound volume/duration
