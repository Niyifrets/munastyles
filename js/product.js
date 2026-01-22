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
  container.innerHTML = `
    <div class="product-error">
      <i class="fas fa-exclamation-circle"></i>
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist or has been removed.</p>
      <a href="shop.html" class="btn-primary">
        <i class="fas fa-arrow-left"></i> Back to Shop
      </a>
    </div>
  `;
  throw new Error("No product ID");
}

async function loadProduct() {
  const productRef = doc(db, "products", productId);
  const snap = await getDoc(productRef);

  if (!snap.exists()) {
    container.innerHTML = `
      <div class="product-error">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <a href="shop.html" class="btn-primary">
          <i class="fas fa-arrow-left"></i> Back to Shop
        </a>
      </div>
    `;
    return;
  }

  const product = snap.data();

  container.innerHTML = `
    <div class="product-detail-container">
      <div class="product-detail-image">
        ${product.imageUrl ? 
          `<img src="${product.imageUrl}" alt="${product.name}" loading="lazy">` : 
          `<div class="product-image-placeholder">
            <i class="fas fa-image"></i>
            <span>No image available</span>
          </div>`
        }
      </div>
      
      <div class="product-detail-info">
        <div class="product-header">
          <h1>${product.name}</h1>
          <div class="product-price">${formatPrice(product.price)}</div>
        </div>
        
        ${product.description ? `
          <div class="product-description">
            <h3>Description</h3>
            <p>${product.description}</p>
          </div>
        ` : ''}
        
        <div class="product-meta">
          <div class="meta-item">
            <span class="meta-label">Category:</span>
            <span class="meta-value">${product.category}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Availability:</span>
            <span class="meta-value available">In Stock</span>
          </div>
        </div>
        
        <div class="product-actions">
          <button id="addToCartBtn" class="btn-add-to-cart">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          
          <a href="https://wa.me/2348131553154" 
             class="btn-whatsapp-order"
             target="_blank"
             rel="noopener noreferrer"
             data-whatsapp
             data-message="Hello Muna Styles, I want to order ${product.name} for ${formatPrice(product.price)}. Can you provide more details?">
            <i class="fab fa-whatsapp"></i> Order via WhatsApp
          </a>
        </div>
        
        <div class="product-support">
          <h3>Need Help?</h3>
          <p>Our team is ready to assist you with sizing, customization, or any questions.</p>
          <a href="https://wa.me/2348131553154" 
             class="support-link"
             target="_blank"
             rel="noopener noreferrer"
             data-whatsapp
             data-message="Hello Muna Styles, I need help with ${product.name}">
            <i class="fas fa-headset"></i> Contact Support
          </a>
        </div>
      </div>
    </div>
  `;
  
  // Add event listener for Add to Cart button
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const productForCart = {
        id: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || ''
      };
      
      addToCart(productForCart);
    });
  }
  
  // Add product detail styles
  const styles = document.createElement('style');
  styles.textContent = `
    .product-detail-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    @media (min-width: 768px) {
      .product-detail-container {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }
    }
    
    .product-detail-image {
      width: 100%;
    }
    
    .product-detail-image img {
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }
    
    .product-image-placeholder {
      width: 100%;
      height: 400px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }
    
    .product-image-placeholder i {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .product-header {
      margin-bottom: 30px;
    }
    
    .product-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: var(--color-text-primary);
    }
    
    .product-price {
      font-size: 2rem;
      color: var(--color-accent);
      font-weight: 700;
    }
    
    .product-description {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-border);
    }
    
    .product-description h3 {
      font-size: 1.25rem;
      margin-bottom: 12px;
      color: var(--color-text-primary);
    }
    
    .product-description p {
      line-height: 1.8;
      color: var(--color-text-secondary);
    }
    
    .product-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-md);
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    
    .meta-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }
    
    .meta-value {
      font-weight: 600;
      color: var(--color-text-primary);
    }
    
    .meta-value.available {
      color: #25D366;
    }
    
    .product-actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .btn-add-to-cart {
      padding: 16px;
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .btn-add-to-cart:hover {
      background: #b58e63;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .btn-whatsapp-order {
      padding: 16px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 1.125rem;
      text-decoration: none;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-align: center;
    }
    
    .btn-whatsapp-order:hover {
      background: #128C7E;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .product-support {
      padding: 20px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    
    .product-support h3 {
      margin-bottom: 10px;
      color: var(--color-text-primary);
    }
    
    .product-support p {
      color: var(--color-text-secondary);
      margin-bottom: 15px;
    }
    
    .support-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--color-accent);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    
    .support-link:hover {
      color: #b58e63;
    }
    
    .product-error {
      text-align: center;
      padding: 60px 20px;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .product-error i {
      font-size: 64px;
      color: var(--color-border);
      margin-bottom: 20px;
    }
    
    .product-error h2 {
      margin-bottom: 15px;
      color: var(--color-text-primary);
    }
    
    .product-error p {
      color: var(--color-text-secondary);
      margin-bottom: 30px;
    }
    
    .product-error .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--color-accent);
      color: white;
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: 600;
    }
  `;
  document.head.appendChild(styles);
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem('muna_cart', JSON.stringify(cart));
  
  // Show notification
  if (window.whatsappService && typeof window.whatsappService.showToast === 'function') {
    window.whatsappService.showToast(`${product.name} added to cart!`, 'success');
  } else {
    // Fallback
    alert(`${product.name} added to cart!`);
  }
  
  // Update cart count
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = count;
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

loadProduct();