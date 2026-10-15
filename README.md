# ShopKart — Full-Stack MERN E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). It features secure JWT authentication, dynamic catalog search and filtering, user wishlists, and real-time global cart state synchronization across components using React Context.

---

## 🚀 Features

- **Authentication & Authorization**: Registration and login using bcrypt password hashing and HTTP-only JWT cookies.
- **Product Catalog**: Paginated product list, category filtering, search, and detailed product views.
- **Persistent Wishlist**: User-specific wishlist toggle synced with MongoDB.
- **Global Shopping Cart**: Real-time cart state managed via React Context (`CartContext`), enforcing stock boundaries, handling stock drift, and displaying ₹ (`en-IN`) currency formatting.
- **Session Protection**: Route guards (`ProtectedRoute`) that automatically clear cart state on logout without relying on `localStorage`.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios, Lucide Icons
- **Backend**: Node.js, Express.js, Mongoose, JWT, Cookie Parser, CORS
- **Database**: MongoDB Atlas

---

## 📂 Project Structure

```text
MERN-ShopKart/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Express route handlers (Auth, Products, Wishlist, Cart)
│   ├── middleware/      # JWT Authentication guards
│   ├── models/          # Mongoose Schemas (Customer, Product)
│   ├── routes/          # API Route Definitions
│   └── index.js         # Server entry point
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, ProductCard, CartItem, ProtectedRoute
    │   ├── context/     # CartContext & WishlistContext
    │   ├── pages/       # Home, Login, Register, Products, ProductDetails, Wishlist, Cart
    │   └── services/    # Axios API helpers
    └── package.json
