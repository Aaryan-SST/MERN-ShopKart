import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

const sampleProducts = [
  // Electronics
  {
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound fidelity.",
    price: 14999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
    stock: 25,
  },
  {
    name: "Ultra-Slim Smartwatch Series 7",
    description: "Advanced fitness tracker with AMOLED touch display, heart rate monitor, SpO2 sensor, and water resistance up to 50m.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    stock: 12,
  },
  {
    name: "Mechanical Gaming Keyboard RGB",
    description: "Compact mechanical keyboard featuring tactile brown switches, customizable per-key RGB backlighting, and braided USB-C cable.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60",
    stock: 0, // Tests out of stock
  },

  // Fashion
  {
    name: "Classic Organic Cotton T-Shirt",
    description: "100% breathable organic combed cotton t-shirt with a relaxed modern fit and reinforced double-stitched hems.",
    price: 799,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60",
    stock: 50,
  },
  {
    name: "Vintage Denim Jacket",
    description: "Timeless trucker jacket crafted from durable stonewashed denim with metal button closures and deep chest pockets.",
    price: 2999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=60",
    stock: 18,
  },
  {
    name: "Breathable Lightweight Running Shoes",
    description: "Engineered mesh running shoes featuring responsive foam cushioning, slip-resistant rubber tread, and ergonomic arch support.",
    price: 3999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60",
    stock: 8,
  },

  // Books
  {
    name: "Atomic Habits by James Clear",
    description: "An easy and proven way to build good habits and break bad ones. Transform your daily routines and achieve remarkable results.",
    price: 499,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60",
    stock: 40,
  },
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive handbook on architectures, storage engines, distributed consensus, and streaming data systems by Martin Kleppmann.",
    price: 1899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=60",
    stock: 15,
  },
  {
    name: "The Pragmatic Programmer: 20th Anniversary Edition",
    description: "Your journey to mastery — timeless software engineering wisdom on technical debt, pragmatic design, and lifelong learning.",
    price: 1299,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60",
    stock: 0, // Tests out of stock
  },

  // Home
  {
    name: "Minimalist Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted matte ceramic mugs with smooth glaze finish, heat-resistant comfort handles, and dishwasher safety.",
    price: 1199,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60",
    stock: 30,
  },
  {
    name: "Nordic Wood & Brass Desk Lamp",
    description: "Adjustable task reading lamp crafted from solid walnut wood and brushed brass, with touch dimmer and warm LED light.",
    price: 2499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60",
    stock: 10,
  },
  {
    name: "Stainless Steel Thermal Water Bottle 1L",
    description: "Double-wall vacuum insulated flask that keeps beverages hot for 12 hours or ice-cold for 24 hours. Leakproof sport lid.",
    price: 899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60",
    stock: 35,
  },
];

const seedProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI environment variable not found in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for product seeding...");

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products across Electronics, Fashion, Books, and Home!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedProducts();
