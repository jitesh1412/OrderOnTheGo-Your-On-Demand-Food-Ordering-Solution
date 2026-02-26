const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  items: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
      },
      quantity: Number
    }
  ],
  totalAmount: {
    type: Number
  },
  deliveryAddress: {
    type: String
  },
  pincode: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  status: {
    type: String,
    default: "Placed"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
