const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String
      }
    }
  ],
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  isVeg: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Food", foodSchema);
