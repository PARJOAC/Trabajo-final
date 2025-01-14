const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const bodyParser = require("body-parser");
const path = require("path");

// Configuración de la aplicación
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Conexión a MongoDB
mongoose
  .connect("mongodb+srv://Trabajo:Trabajo@cluster0.1ftbn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Inicializar datos
async function initializeData() {
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    await User.create({
      username: "admin",
      password: "admin123", // ¡Usar bcrypt en producción!
      role: "admin",
    });
  }

  const userExists = await User.findOne({ username: "user" });
  if (!userExists) {
    await User.create({
      username: "user",
      password: "user123", // ¡Usar bcrypt en producción!
      role: "user",
    });
  }

  const products = await Product.find();
  if (products.length === 0) {
    await Product.insertMany([
      { name: "Teclado Mecánico", price: 50, description: "Teclado RGB con switches mecánicos." },
      { name: "Monitor 24''", price: 120, description: "Monitor Full HD para trabajo y juegos." },
      { name: "Ratón Inalámbrico", price: 25, description: "Ratón ergonómico con conexión Bluetooth." },
    ]);
  }

  console.log("Datos iniciales cargados.");
}
initializeData().catch(console.error);

// Rutas de autenticación
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  res.json({ role: user.role });
});

// Rutas para productos
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const { name, price, description } = req.body;

  const product = new Product({ name, price, description });
  await product.save();
  res.status(201).json(product);
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  await Product.findByIdAndDelete(id);
  res.status(204).send();
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
