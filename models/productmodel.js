import mongoose from "mongoose";
const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    maxLength: [6, "Your price exceeded the limit"],
  },
  discount: {
    type: Number,
    default: 0,
  },
  colors: [{ type: String }],
  brand: {
    type: String,
    default: "none",
  },
  sizes: [{ type: String }],
  images: [
    {
      public_id: { type: String, required: true },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  no_of_reviews: {
    type: Number,
    default: 0,
  },
  avg_rating: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    minLength: [2, "can exceed stock more than 99"],
    default: 1,
  },
  category: {
    type: String,
    required: [true, `Please enter product category`],
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  time: {
    type: Date,
    default: Date.now,
  },
});

const Product = new mongoose.model("product", Schema);
export default Product;
