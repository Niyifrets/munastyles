import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const productsContainer = document.getElementById("products");
const filterButtons = document.querySelectorAll(".filters button");
const searchInput = document.getElementById("searchInput");

let allProducts = [];
let currentCategory = "all";

/* =======================
   FETCH PRODUCTS
======================= */
async function fetchProducts() {
  productsContainer.innerHTML = "Loading...";

  let q;
  if (currentCategory === "all") {
    q = query(collection(db, "products"), where("status", "==", "active"));
  } else {
    q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      where("category", "==", currentCategory)
    );
  }

  const snapshot = await getDocs(q);
  allProducts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderProducts(allProducts);
}

/* =======================
   RENDER PRODUCTS
======================= */
function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("a");
    card.href = `product.html?id=${product.id}`;
    card.className = "product-card";

    card.innerHTML = `
      ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}">` : ""}
      <h3>${product.name}</h3>
      <p class="price">₦${product.price}</p>
    `;

    productsContainer.appendChild(card);
  });
}

/* =======================
   SEARCH
======================= */
searchInput?.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.description && p.description.toLowerCase().includes(term))
  );

  renderProducts(filtered);
});

/* =======================
   CATEGORY FILTERS
======================= */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    searchInput.value = "";
    fetchProducts();

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* =======================
   INITIAL LOAD
======================= */
fetchProducts();