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
let isLoading = false;
let currentPage = 1;
const productsPerPage = 12;
let filteredProducts = [];

/* =======================
   FETCH ALL PRODUCTS
======================= */
async function fetchProducts() {
  if (isLoading) return;
  
  isLoading = true;
  productsContainer.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading products...</p>
    </div>
  `;

  let q;
  try {
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

    // Reset pagination
    currentPage = 1;
    filteredProducts = [...allProducts];
    
    renderProducts();
    updatePagination();
    updateProductCount();
    
  } catch (error) {
    console.error("Error fetching products:", error);
    showError("Unable to load products. Please check your connection and try again.");
  } finally {
    isLoading = false;
  }
}

/* =======================
   RENDER PRODUCTS WITH PAGINATION
======================= */
function renderProducts() {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  productsContainer.innerHTML = "";

  if (productsToShow.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Products Found</h3>
        <p>${searchInput.value ? `No results for "${searchInput.value}". Try a different search term.` : 'Try selecting a different category.'}</p>
        <button class="btn-secondary reset-filters">
          <i class="fas fa-redo"></i> Show All Products
        </button>
      </div>
    `;
    
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

  productsToShow.forEach(product => {
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
          ${product.price > 50000 ? `<div class="product-premium">Premium</div>` : ''}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">${formatPrice(product.price)}</div>
          ${product.description ? `<p class="product-description">${truncateText(product.description, 60)}</p>` : ''}
          <div class="product-actions">
            <button class="btn-quick-view" data-id="${product.id}" aria-label="Quick view">
              <i class="fas fa-eye"></i>
            </button>
          </div>
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

  // Add event listeners
  setupProductEventListeners();
}

function setupProductEventListeners() {
  // Add to Cart buttons
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
      
      // Visual feedback
      this.classList.add('added');
      this.innerHTML = '<i class="fas fa-check"></i> Added!';
      
      setTimeout(() => {
        this.classList.remove('added');
        this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
      }, 1500);
    });
  });
  
  // Quick View buttons
  document.querySelectorAll('.btn-quick-view').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const productId = this.getAttribute('data-id');
      showQuickView(productId);
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
  updateCartCount();
  showAddToCartNotification(product.name);
}

function showAddToCartNotification(productName) {
  if (window.whatsappService && typeof window.whatsappService.showToast === 'function') {
    window.whatsappService.showToast(`${productName} added to cart!`, 'success');
  } else {
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
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

/* =======================
   SEARCH FUNCTIONALITY
======================= */
let searchTimeout;
searchInput?.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    const term = searchInput.value.trim().toLowerCase();
    
    if (term === '') {
      filteredProducts = [...allProducts];
      currentPage = 1;
      renderProducts();
      updatePagination();
      updateProductCount();
      return;
    }
    
    filteredProducts = allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term)
    );

    currentPage = 1;
    renderProducts();
    updatePagination();
    updateProductCount();
    
    if (term && filteredProducts.length > 0) {
      showSearchResultsCount(filteredProducts.length, term);
    }
  }, 300);
});

function showSearchResultsCount(count, term) {
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
  
  const searchContainer = searchInput.closest('.search-container');
  if (searchContainer) {
    searchContainer.parentNode.insertBefore(countElement, searchContainer.nextSibling);
    
    const clearBtn = countElement.querySelector('.clear-search');
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filteredProducts = [...allProducts];
      currentPage = 1;
      renderProducts();
      updatePagination();
      updateProductCount();
      countElement.remove();
    });
  }
}

/* =======================
   CATEGORY FILTERS
======================= */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    searchInput.value = "";
    
    const searchResults = document.querySelector('.search-results-count');
    if (searchResults) searchResults.remove();
    
    fetchProducts();

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    if (window.innerWidth < 768) {
      productsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});

/* =======================
   PAGINATION
======================= */
function updatePagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Remove existing pagination
  const existingPagination = document.querySelector('.pagination');
  if (existingPagination) existingPagination.remove();
  
  if (totalPages <= 1) return;
  
  const pagination = document.createElement('div');
  pagination.className = 'pagination';
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i> Previous
    </button>
  `;
  
  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
              data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? 'disabled' : ''}>
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = paginationHTML;
  
  // Insert after products container
  productsContainer.parentNode.insertBefore(pagination, productsContainer.nextSibling);
  
  // Add event listeners
  pagination.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.getAttribute('data-page'));
      if (page && page !== currentPage) {
        currentPage = page;
        renderProducts();
        updatePagination();
        
        // Scroll to top of products
        productsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* =======================
   QUICK VIEW FUNCTIONALITY
======================= */
async function showQuickView(productId) {
  try {
    // In a real implementation, you would fetch the product details
    // For now, redirect to product page
    window.location.href = `product.html?id=${productId}`;
  } catch (error) {
    console.error('Error showing quick view:', error);
  }
}

/* =======================
   UTILITY FUNCTIONS
======================= */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateProductCount() {
  const existingCount = document.querySelector('.product-count');
  if (existingCount) existingCount.remove();
  
  if (filteredProducts.length === 0) return;
  
  const countElement = document.createElement('div');
  countElement.className = 'product-count';
  
  const startIndex = (currentPage - 1) * productsPerPage + 1;
  const endIndex = Math.min(currentPage * productsPerPage, filteredProducts.length);
  
  countElement.innerHTML = `
    <span>Showing ${startIndex}-${endIndex} of ${filteredProducts.length} products</span>
  `;
  
  // Insert before products container
  productsContainer.parentNode.insertBefore(countElement, productsContainer);
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
  
  const retryBtn = productsContainer.querySelector('.retry-loading');
  if (retryBtn) {
    retryBtn.addEventListener('click', fetchProducts);
  }
}

/* =======================
   INITIALIZE PAGE
======================= */
function initializePage() {
  fetchProducts();
  updateCartCount();
  injectStyles();
  
  // Keyboard navigation for filters
  filterButtons.forEach((btn, index) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && index < filterButtons.length - 1) {
        filterButtons[index + 1].focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        filterButtons[index - 1].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        btn.click();
      }
    });
  });
}

function injectStyles() {
  const styles = document.createElement('style');
  styles.textContent = `
    /* Product Count */
    .product-count {
      text-align: center;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
      font-size: 0.875rem;
    }
    
    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 40px;
      flex-wrap: wrap;
    }
    
    .pagination-btn {
      padding: 8px 16px;
      border: 1px solid var(--color-border);
      background: var(--color-bg-card);
      color: var(--color-text-primary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .pagination-btn:hover:not(.disabled):not(.active) {
      background: var(--color-bg-secondary);
      border-color: var(--color-border);
    }
    
    .pagination-btn.active {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }
    
    .pagination-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Premium Badge */
    .product-premium {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      background: #FFD700;
      color: #000;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    /* Product Actions */
    .product-actions {
      margin-top: 10px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    }
    
    .product-card:hover .product-actions {
      opacity: 1;
      transform: translateY(0);
    }
    
    .btn-quick-view {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      border-radius: var(--radius-sm);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-quick-view:hover {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }
    
    /* Shop-specific styles */
    .shop-header {
      margin-bottom: 40px;
    }
    
    .shop-header h1 {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }
    
    .shop-header .lead {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }
    
    /* Loading, Empty, Error States (same as shop-home.js) */
    .loading-state, .empty-state, .error-state {
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
    
    .empty-state i {
      font-size: 64px;
      margin-bottom: 20px;
      color: var(--color-border);
    }
    
    .empty-state h3, .error-state h3 {
      margin-bottom: 10px;
      color: var(--color-text-primary);
    }
    
    .empty-state p, .error-state p {
      color: var(--color-text-secondary);
      margin-bottom: 30px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }
    
    .btn-primary {
      background: var(--color-accent);
      color: white;
    }
    
    .btn-secondary {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }
    
    .btn-primary:hover {
      background: #b58e63;
      transform: translateY(-2px);
    }
    
    .btn-secondary:hover {
      background: var(--color-border);
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
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .shop-header h1 {
        font-size: 2rem;
      }
      
      .pagination {
        gap: 4px;
      }
      
      .pagination-btn {
        padding: 6px 12px;
        font-size: 0.8125rem;
      }
      
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
    
    @media (max-width: 480px) {
      .shop-header h1 {
        font-size: 1.75rem;
      }
      
      .pagination {
        flex-wrap: wrap;
      }
      
      .product-grid {
        grid-template-columns: 1fr;
      }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styles);
}

/* =======================
   INITIALIZE
======================= */
document.addEventListener('DOMContentLoaded', initializePage);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initializePage();
}