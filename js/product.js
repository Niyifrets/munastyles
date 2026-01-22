import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const container = document.getElementById("productDetails");

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  container.innerHTML = "<p>Product not found.</p>";
  throw new Error("No product ID");
}

async function loadProduct() {
  const productRef = doc(db, "products", productId);
  const snap = await getDoc(productRef);

  if (!snap.exists()) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  const product = snap.data();

  container.innerHTML = `
    <div class="product-detail-card">
      ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}">` : ""}

      <div class="details">
        <h1>${product.name}</h1>
        <p class="price">₦${product.price}</p>
        ${product.description ? `<p>${product.description}</p>` : ""}
        <p class="category">Category: ${product.category}</p>

        <a
          href="https://wa.me/2347010440412?text=Hello%20I%20want%20to%20order%20${encodeURIComponent(product.name)}%20for%20₦${product.price}"
          target="_blank"
          class="whatsapp-btn"
        >
          Order on WhatsApp
        </a>
      </div>
    </div>
  `;
}

loadProduct();