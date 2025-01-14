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
        <h3>${product.name}</h3>
        <img src="${product.imageUrl}" alt="${product.name}" style="max-width: 150px; border-radius: 8px; margin: 10px 0;">
        <p>Precio: ${product.price} €</p>
        <p>${product.description}</p>
        <button onclick="addToCart('${product._id}')">Añadir a la cesta</button>
        <button onclick="deleteProduct('${product._id}')">Eliminar</button>
      `;
      productList.appendChild(productDiv);
    });
  });
  
  // Función para añadir productos a la cesta
  function addToCart(productId) {
    alert(`Producto con ID ${productId} añadido a la cesta.`);
  }
  
  // Función para eliminar productos
  async function deleteProduct(productId) {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    location.reload();
  }
  