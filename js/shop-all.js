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
   FETCH ALL PRODUCTS
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

  try {
    const snapshot = await getDocs(q);
    allProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    productsContainer.innerHTML = "<p>Unable to load products. Please try again later.</p>";
  }
}

/* =======================
   RENDER PRODUCTS WITH ADD TO CART
======================= */
function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card with-cart";

    card.innerHTML = `
      <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}">` : ''}
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>
      </a>
      <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.imageUrl || ''}">
        <i class="fas fa-cart-plus"></i> Add to Cart
      </button>
    `;

    productsContainer.appendChild(card);
  });

  // Add event listeners to Add to Cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const product = {
        id: this.getAttribute('data-id'),
        name: this.getAttribute('data-name'),
        price: parseFloat(this.getAttribute('data-price')), // Store raw number
        imageUrl: this.getAttribute('data-image')
      };
      
      addToCart(product);
    });
  });
}

/* =======================
   ADD TO CART FUNCTION
======================= */
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem('muna_cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Show feedback
  showAddToCartFeedback(product.name);
}

function showAddToCartFeedback(productName) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--color-accent);
    color: white;
    padding: 15px 20px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;
  
  feedback.innerHTML = `
    <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
    <strong>${productName}</strong> added to cart!
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = count;
}

/* =======================
   SEARCH FUNCTIONALITY
======================= */
searchInput?.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.description && p.description.toLowerCase().includes(term)) ||
    p.category.toLowerCase().includes(term)
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