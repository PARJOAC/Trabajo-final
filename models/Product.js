const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" }, // URL de la imagen del producto
});

module.exports = mongoose.model("Product", productSchema);
