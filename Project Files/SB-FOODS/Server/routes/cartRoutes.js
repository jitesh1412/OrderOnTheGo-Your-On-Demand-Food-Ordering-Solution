const express = require("express");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ADD TO CART (User Only)
router.post("/add", protect, authorize("user"), async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.food");

    if (cart && cart.items.length > 0) {
      // Find the first valid food item in the cart to check restaurant
      const firstValidItem = cart.items.find(item => item.food);

      if (firstValidItem) {
        const existingRestaurantId = firstValidItem.food.restaurant.toString();
        if (existingRestaurantId !== food.restaurant.toString()) {
          return res.status(400).json({
            message: "You can only add items from one restaurant at a time. Please clear your cart first."
          });
        }
      }
    }

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ food: foodId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.food && (item.food._id || item.food).toString() === foodId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ food: foodId, quantity });
      }

      await cart.save();
    }

    res.json({ message: "Item added to cart", cart });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET CART (User Only)
router.get("/", protect, authorize("user"), async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.food");

  if (cart) {
    // Filter out items that have been deleted from the database
    cart.items = cart.items.filter(item => item.food !== null);
  }

  res.json(cart);
});

// REMOVE ITEM FROM CART
router.delete("/remove/:foodId", protect, authorize("user"), async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    item => item.food.toString() !== req.params.foodId
  );

  await cart.save();

  res.json({ message: "Item removed from cart", cart });
});

// UPDATE QUANTITY
router.put("/update", protect, authorize("user"), async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      item => item.food.toString() === foodId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        item => item.food.toString() !== foodId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({ message: "Cart updated", cart });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
