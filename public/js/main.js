document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");

  // Obtener los productos desde la API
  const response = await fetch("/api/products");
  const products = await response.json();

  // Renderizar los productos
  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">${product.price} €</p>
      <p>${product.description}</p>
      <button onclick="addToCart('${product._id}')">Añadir a la cesta</button>
    `;
    productList.appendChild(productDiv);
  });
});

// Función para añadir productos a la cesta
async function addToCart(productId) {
  const response = await fetch("/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });

  if (response.ok) {
    alert("Producto agregado a la cesta.");
  } else {
    alert("Debes iniciar sesión para agregar productos a la cesta.");
  }
}
