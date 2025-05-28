require("dotenv").config();
const mongoose = require("mongoose");
const { Product } = require("./model/Product");

const products = [
  {
    title: "Women's Summer Sandals",
    description: "Elegant and comfortable sandals perfect for summer outings.",
    price: 1299,
    discountPercentage: 12,
    rating: 4.3,
    stock: 60,
    brand: "Clarks",
    category: "Footwear",
    thumbnail: "https://m.media-amazon.com/images/I/61Isx8NuNsL._AC_UY1000_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61Isx8NuNsL._AC_UY1000_.jpg",
      "https://m.media-amazon.com/images/I/61Isx8NuNsL._AC_UY1000_.jpg"
    ],
    colors: ["beige", "brown"],
    sizes: [5, 6, 7, 8],
    highlights: ["Breathable design", "Soft sole"],
    discountedPrice: 1143,
  },
  {
    title: "Classic Women's Sandals",
    description: "Timeless sandals that combine comfort and style for everyday wear.",
    price: 1399,
    discountPercentage: 8,
    rating: 4.1,
    stock: 50,
    brand: "Naturalizer",
    category: "Footwear",
    thumbnail: "https://example.com/images/womens-sandal-classic-thumb.jpg",
    images: [
      "https://example.com/images/womens-sandal-classic1.jpg",
      "https://example.com/images/womens-sandal-classic2.jpg"
    ],
    colors: ["tan", "black"],
    sizes: [6, 7, 8],
    highlights: ["Soft footbed", "Adjustable strap"],
    discountedPrice: 1287,
  },
  {
    title: "Elegant Strappy Sandals",
    description: "Perfect for parties and formal occasions, with a stylish strappy design.",
    price: 1599,
    discountPercentage: 10,
    rating: 4.5,
    stock: 40,
    brand: "Aldo",
    category: "Footwear",
    thumbnail: "https://example.com/images/womens-sandal-strappy-thumb.jpg",
    images: [
      "https://example.com/images/womens-sandal-strappy1.jpg",
      "https://example.com/images/womens-sandal-strappy2.jpg"
    ],
    colors: ["gold", "silver"],
    sizes: [6, 7, 8, 9],
    highlights: ["Elegant straps", "Comfortable heel"],
    discountedPrice: 1439,
  },
  {
    title: "Casual Slip-On Sandals",
    description: "Easy to wear slip-on sandals for daily casual use.",
    price: 999,
    discountPercentage: 5,
    rating: 4.0,
    stock: 70,
    brand: "Skechers",
    category: "Footwear",
    thumbnail: "https://example.com/images/womens-sandal-slipon-thumb.jpg",
    images: [
      "https://example.com/images/womens-sandal-slipon1.jpg",
      "https://example.com/images/womens-sandal-slipon2.jpg"
    ],
    colors: ["white", "navy blue"],
    sizes: [5, 6, 7, 8],
    highlights: ["Slip-on convenience", "Cushioned sole"],
    discountedPrice: 949,
  },
  {
    title: "Beach Flat Sandals",
    description: "Lightweight flat sandals ideal for beach and casual wear.",
    price: 899,
    discountPercentage: 7,
    rating: 4.2,
    stock: 80,
    brand: "Crocs",
    category: "Footwear",
    thumbnail: "https://example.com/images/womens-sandal-beach-thumb.jpg",
    images: [
      "https://example.com/images/womens-sandal-beach1.jpg",
      "https://example.com/images/womens-sandal-beach2.jpg"
    ],
    colors: ["blue", "pink", "white"],
    sizes: [5, 6, 7, 8, 9],
    highlights: ["Water resistant", "Easy to clean"],
    discountedPrice: 836,
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    await Product.deleteMany({});
    console.log("Old products cleared");

    await Product.insertMany(products);
    console.log("Women’s sandals inserted");

    mongoose.disconnect();
    console.log("Disconnected from DB");
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.disconnect();
  }
}

seed();
