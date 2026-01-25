import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const productsContainer = document.getElementById("products");
const filterButtons = document.querySelectorAll(".filters button");
const searchInput = document.getElementById("searchInput");

let allProducts = [];
let currentCategory = "all";
let isLoading = false;

/* ========================
   FETCH PRODUCTS (LIMITED TO 8)
======================== */
async function fetchProducts() {
  if (isLoading) return;
  
  isLoading = true;
  productsContainer.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading featured products...</p>
    </div>
  `;

  let q;
  try {
    if (currentCategory === "all") {
      q = query(
        collection(db, "products"), 
        where("status", "==", "active"),
        limit(8)  // CHANGED TO 8 PRODUCTS
      );
    } else {
      q = query(
        collection(db, "products"),
        where("status", "==", "active"),
        where("category", "==", currentCategory),
        limit(8)  // CHANGED TO 8 PRODUCTS
      );
    }

    const snapshot = await getDocs(q);
    allProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    showError("Unable to load products. Please check your connection and try again.");
  } finally {
    isLoading = false;
  }
}

/* ========================
   RENDER PRODUCTS WITH ADD TO CART
======================== */
function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Products Found</h3>
        <p>Try selecting a different category or search term</p>
        <button class="btn-secondary reset-filters">
          <i class="fas fa-redo"></i> Reset Filters
        </button>
      </div>
    `;
    
    // Add reset functionality
    const resetBtn = productsContainer.querySelector('.reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentCategory = 'all';
        filterButtons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        fetchProducts();
      });
    }
    
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card with-cart";
    card.dataset.category = product.category;

    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="product-link">
        <div class="product-image-container">
          ${product.imageUrl ? 
            `<img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">` : 
            `<div class="product-image-placeholder">
              <i class="fas fa-image"></i>
              <span>Image coming soon</span>
            </div>`
          }
          <div class="product-badge">${product.category}</div>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">${formatPrice(product.price)}</div>
          ${product.description ? `<p class="product-description">${truncateText(product.description, 80)}</p>` : ''}
        </div>
      </a>
      <button class="add-to-cart-btn" 
              data-id="${product.id}" 
              data-name="${product.name}" 
              data-price="${product.price}" 
              data-image="${product.imageUrl || ''}"
              aria-label="Add ${product.name} to cart">
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
        price: parseFloat(this.getAttribute('data-price')),
        imageUrl: this.getAttribute('data-image')
      };
      
      addToCart(product);
      
      // Add visual feedback
      this.classList.add('added');
      this.innerHTML = '<i class="fas fa-check"></i> Added!';
      
      setTimeout(() => {
        this.classList.remove('added');
        this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
      }, 1500);
    });
  });
}

/* ========================
   ADD TO CART FUNCTION
======================== */
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
  
  // Show notification
  showAddToCartNotification(product.name);
}

function showAddToCartNotification(productName) {
  // Use whatsappService toast if available
  if (window.whatsappService && typeof window.whatsappService.showToast === 'function') {
    window.whatsappService.showToast(`${productName} added to cart!`, 'success');
  } else {
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = 'add-to-cart-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <div>
          <strong>${productName}</strong>
          <p>Added to your shopping cart</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

/* ========================
   SEARCH FUNCTIONALITY
======================== */
let searchTimeout;
searchInput?.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    const term = searchInput.value.trim().toLowerCase();
    
    if (term === '') {
      renderProducts(allProducts);
      return;
    }
    
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term)
    );

    renderProducts(filtered);
    
    // Show search results count
    if (term && filtered.length > 0) {
      showSearchResultsCount(filtered.length, term);
    }
  }, 300);
});

function showSearchResultsCount(count, term) {
  // Remove any existing result count
  const existingCount = document.querySelector('.search-results-count');
  if (existingCount) existingCount.remove();
  
  const countElement = document.createElement('div');
  countElement.className = 'search-results-count';
  countElement.innerHTML = `
    <i class="fas fa-search"></i>
    <span>Found ${count} product${count === 1 ? '' : 's'} for "${term}"</span>
    <button class="clear-search" aria-label="Clear search">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Insert after search input
  const searchContainer = searchInput.closest('.search-container');
  if (searchContainer) {
    searchContainer.parentNode.insertBefore(countElement, searchContainer.nextSibling);
    
    // Add clear search functionality
    const clearBtn = countElement.querySelector('.clear-search');
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      renderProducts(allProducts);
      countElement.remove();
    });
  }
}

/* ========================
   CATEGORY FILTERS
======================== */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    searchInput.value = "";
    
    // Remove search results count if present
    const searchResults = document.querySelector('.search-results-count');
    if (searchResults) searchResults.remove();
    
    fetchProducts();

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    // Scroll products into view on mobile
    if (window.innerWidth < 768) {
      productsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});

/* ========================
   UTILITY FUNCTIONS
======================== */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function showError(message) {
  productsContainer.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Oops! Something went wrong</h3>
      <p>${message}</p>
      <button class="btn-primary retry-loading">
        <i class="fas fa-redo"></i> Try Again
      </button>
    </div>
  `;
  
  // Add retry functionality
  const retryBtn = productsContainer.querySelector('.retry-loading');
  if (retryBtn) {
    retryBtn.addEventListener('click', fetchProducts);
  }
}

/* ========================
   INITIAL LOAD & SETUP
======================== */
function initializePage() {
  // Load products
  fetchProducts();
  
  // Update cart count
  updateCartCount();
  
  // Add keyboard navigation to filters
  filterButtons.forEach((btn, index) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && index < filterButtons.length - 1) {
        filterButtons[index + 1].focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        filterButtons[index - 1].focus();
      }
    });
  });
  
  // Add styles
  injectStyles();
}

function injectStyles() {
  const styles = document.createElement('style');
  styles.textContent = `
    /* Loading State */
    .loading-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
    }
    
    .loading-spinner {
      font-size: 48px;
      color: var(--color-accent);
      margin-bottom: 20px;
    }
    
    .loading-spinner i {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-secondary);
    }
    
    .empty-state i {
      font-size: 64px;
      margin-bottom: 20px;
      color: var(--color-border);
    }
    
    .empty-state h3 {
      margin-bottom: 10px;
      color: var(--color-text-primary);
    }
    
    .empty-state .btn-secondary {
      margin-top: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Error State */
    .error-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
    }
    
    .error-state i {
      font-size: 64px;
      color: #e74c3c;
      margin-bottom: 20px;
    }
    
    .error-state h3 {
      margin-bottom: 10px;
      color: var(--color-text-primary);
    }
    
    .error-state p {
      color: var(--color-text-secondary);
      margin-bottom: 30px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .error-state .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Product Card Styles */
    .product-card {
      position: relative;
      overflow: hidden;
    }
    
    .product-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }
    
    .product-image-container {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      background: var(--color-bg-secondary);
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .product-card:hover .product-image {
      transform: scale(1.05);
    }
    
    .product-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-border);
    }
    
    .product-image-placeholder i {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    .product-image-placeholder span {
      font-size: 0.875rem;
    }
    
    .product-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 10px;
      background: var(--color-accent);
      color: white;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .product-info {
      padding: 16px;
    }
    
    .product-title {
      font-size: 1.125rem;
      margin-bottom: 8px;
      line-height: 1.4;
      color: var(--color-text-primary);
    }
    
    .product-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-accent);
      margin-bottom: 8px;
    }
    
    .product-description {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-top: 8px;
    }
    
    /* Add to Cart Button States */
    .add-to-cart-btn {
      transition: all 0.3s ease;
    }
    
    .add-to-cart-btn.added {
      background: #25D366 !important;
    }
    
    .add-to-cart-btn.added i {
      animation: bounce 0.5s ease;
    }
    
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    
    /* Search Results Count */
    .search-results-count {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      margin: 10px 0 20px;
      color: var(--color-text-secondary);
    }
    
    .search-results-count i {
      color: var(--color-accent);
    }
    
    .search-results-count span {
      flex: 1;
    }
    
    .clear-search {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .clear-search:hover {
      background: var(--color-border);
      color: var(--color-text-primary);
    }
    
    /* Add to Cart Notification */
    .add-to-cart-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 16px;
      max-width: 350px;
      transform: translateX(120%);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 10001;
    }
    
    .add-to-cart-notification.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .notification-content i {
      color: #25D366;
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .notification-content strong {
      display: block;
      margin-bottom: 4px;
      color: var(--color-text-primary);
    }
    
    .notification-content p {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0;
    }
    
    /* Responsive Design - 2 Columns on Mobile */
    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: repeat(2, 1fr) !important; /* 2 columns on mobile */
        gap: 16px;
      }
      
      .product-image-container {
        height: 180px; /* Slightly reduce height for mobile */
      }
      
      .product-title {
        font-size: 1rem;
      }
      
      .product-price {
        font-size: 1.125rem;
      }
      
      .search-results-count {
        font-size: 0.875rem;
      }
      
      .add-to-cart-notification {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
    
    @media (max-width: 480px) {
      .product-grid {
        grid-template-columns: repeat(2, 1fr) !important; /* Keep 2 columns */
        gap: 12px;
      }
      
      .product-image-container {
        height: 160px;
      }
      
      .product-card {
        min-height: 280px; /* Ensure consistent height */
      }
      
      .add-to-cart-btn {
        padding: 10px;
        font-size: 0.875rem;
      }
    }
    
    @media (max-width: 360px) {
      .product-grid {
        grid-template-columns: 1fr; /* Single column on very small screens */
      }
    }
  `;
  document.head.appendChild(styles);
}

/* ========================
   INITIALIZE PAGE
======================== */
document.addEventListener('DOMContentLoaded', initializePage);

// Also initialize if DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initializePage();
}