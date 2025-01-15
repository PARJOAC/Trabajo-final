document.addEventListener("DOMContentLoaded", async () => {
  const productContainer = document.getElementById("product-container");

  // Obtener los productos desde la API
  const response = await fetch("/api/products");
  const products = await response.json();

  // Renderizar los productos
  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    function truncateString(str, maxLength = 100) {
      if (str.length > maxLength) {
          return str.slice(0, maxLength) + "...";
      }
      return str;
  }
    productDiv.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <div class="info">
        <h2>${product.name}</h2>
        <p>${truncateString(product.description)}</p>
        <p class="price">${product.price} €</p>
        <button onclick="addToCart('${product._id}')">Añadir a la cesta</button>
      </div>
    `;
    productContainer.appendChild(productDiv);
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