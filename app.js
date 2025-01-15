const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

require("dotenv").config();

const app = express();

// Configuración para guardar el inicio de sesión
app.use(
  session({
    secret: "EstoEsUnCodigoSecreto",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 día caduca la cookie
  })
);

// Middleware para procesar JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Ruta para el registro
app.post("/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email: email }); // Verificando que el email no esté en uso

  if (existingUser) return res.status(400).json({ message: "El correo electrónico ya está en uso." });

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  //Crear el usuario
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(201).json({ message: "Cuenta creada con éxito" });
});

// Ruta para iniciar sesión
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) return res.status(401).json({ message: "Credenciales incorrectas" });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) return res.status(401).json({ message: "Credenciales incorrectas" });

 // Almacenar la sesión
  req.session.user = { username: user.username, role: user.role };
  res.json({ role: user.role });
});

// Ruta para cerrar sesión
app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
    res.status(200).json({ message: "Sesión cerrada" });
  });
});

// Rutas para productos
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const { name, price, description, imageUrl } = req.body;

  const product = new Product({ name, price, description, imageUrl });
  await product.save();
  res.status(201).json(product);
});

// Ruta para verificar si el usuario está logueado
app.get("/auth/status", (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    return res.json({ loggedIn: false });
  }
});

// Ruta para cerrar sesión
app.get("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.redirect("/");  // Redirige al inicio después de cerrar sesión
  });
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  await Product.findByIdAndDelete(id);
  res.status(204).send();
});

// Ruta para obtener los productos en la cesta
app.get("/cart", (req, res) => {
  if (!req.session.cart) return res.status(200).json([]); // Si no hay productos en la cesta, devuelve nada

  // Obtener detalles completos de los productos en la cesta (incluyendo imagen y nombre)
  const cartItems = req.session.cart.map(item => {
    return {
      ...item,
      imageUrl: item.imageUrl,  // Asegúrate de que el campo imageUrl esté presente
    };
  });

  res.status(200).json(cartItems);
});

// Ruta para agregar un producto a la cesta
app.post("/cart/add", async (req, res) => {
  const { productId } = req.body;
  const user = req.session.user;

  if (!user) return res.status(401).json({ message: "Debes iniciar sesión para agregar productos a la cesta." });

  try {
    // Buscar el producto en la base de datos
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    // Si la cesta no existe, crear una nueva
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Comprobar si el producto ya está en la cesta
    const existingProduct = req.session.cart.find(item => item.productId === productId);
    if (existingProduct) {
      existingProduct.quantity++; // Incrementar la cantidad si el producto ya está en la cesta
    } else {
      req.session.cart.push({
        productId: productId,
        quantity: 1,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl,
      });
    }

    res.status(200).json({ message: "Producto agregado a la cesta." });
  } catch (err) {
    res.status(500).json({ message: "Error al agregar el producto a la cesta.", error: err.message });
  }
});



// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
