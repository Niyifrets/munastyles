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

let allImages = [];
let currentImageIndex = 0;

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

  // Get all images (main + gallery)
  allImages = [product.imageUrl, ...(product.galleryImages || [])].filter(Boolean);

  container.innerHTML = `
    <div class="product-detail-container">
      <div class="product-gallery">
        <!-- Main Image with tap/click to open gallery -->
        <div class="main-image">
          ${product.imageUrl ? 
            `<img src="${product.imageUrl}" alt="${product.name}" loading="lazy" id="mainImage" class="gallery-trigger">` : 
            `<div class="product-image-placeholder">
              <i class="fas fa-image"></i>
              <span>No image available</span>
            </div>`
          }
        </div>
        
        <!-- Thumbnails if multiple images exist -->
        ${allImages.length > 1 ? `
          <div class="image-thumbnails">
            ${allImages.map((img, index) => `
              <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${img}" alt="${product.name} view ${index + 1}" loading="lazy" class="gallery-trigger">
              </div>
            `).join('')}
          </div>
        ` : ''}
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
          ${allImages.length > 1 ? `
            <div class="meta-item">
              <span class="meta-label">Images:</span>
              <span class="meta-value">${allImages.length} photos</span>
            </div>
          ` : ''}
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
    
    <!-- Gallery Modal -->
    <div class="gallery-modal" id="galleryModal">
      <div class="gallery-modal-content">
        <div class="gallery-header">
          <h3>${product.name}</h3>
          <button class="close-gallery" aria-label="Close gallery">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="gallery-main">
          <button class="gallery-nav prev" aria-label="Previous image">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="gallery-image-container" id="galleryImageContainer">
            <img id="galleryMainImage" src="" alt="${product.name}" loading="lazy">
          </div>
          
          <button class="gallery-nav next" aria-label="Next image">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="gallery-info">
          <div class="image-counter">
            <span id="currentImage">1</span> / <span id="totalImages">${allImages.length}</span>
          </div>
          <div class="gallery-actions">
            <button class="gallery-action-btn zoom-in" aria-label="Zoom in">
              <i class="fas fa-search-plus"></i>
            </button>
            <button class="gallery-action-btn zoom-out" aria-label="Zoom out">
              <i class="fas fa-search-minus"></i>
            </button>
            <button class="gallery-action-btn reset-zoom" aria-label="Reset zoom">
              <i class="fas fa-expand-arrows-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="gallery-thumbnails">
          ${allImages.map((img, index) => `
            <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
              <img src="${img}" alt="${product.name} view ${index + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  // Set initial gallery image
  if (allImages.length > 0) {
    document.getElementById('galleryMainImage').src = allImages[0];
  }
  
  // Add event listeners for thumbnails (original page thumbnails)
  const thumbnails = document.querySelectorAll('.thumbnail');
  if (thumbnails.length > 0) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        const imgSrc = this.querySelector('img').src;
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
          mainImage.src = imgSrc;
        }
        
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
  
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
  
  // Initialize gallery functionality
  initGallery();
  
  // Add product detail styles
  addProductDetailStyles();
}

function initGallery() {
  const galleryModal = document.getElementById('galleryModal');
  const closeGalleryBtn = document.querySelector('.close-gallery');
  const galleryTriggers = document.querySelectorAll('.gallery-trigger');
  const prevBtn = document.querySelector('.gallery-nav.prev');
  const nextBtn = document.querySelector('.gallery-nav.next');
  const galleryThumbnails = document.querySelectorAll('.gallery-thumbnail');
  const zoomInBtn = document.querySelector('.zoom-in');
  const zoomOutBtn = document.querySelector('.zoom-out');
  const resetZoomBtn = document.querySelector('.reset-zoom');
  const galleryMainImage = document.getElementById('galleryMainImage');
  const galleryImageContainer = document.getElementById('galleryImageContainer');
  const currentImageSpan = document.getElementById('currentImage');
  const totalImagesSpan = document.getElementById('totalImages');
  
  let zoomLevel = 1;
  const zoomStep = 0.2;
  const maxZoom = 3;
  const minZoom = 1;
  
  // Dragging variables
  let isDragging = false;
  let startX, startY;
  let translateX = 0, translateY = 0;
  
  // Set total images
  totalImagesSpan.textContent = allImages.length;
  
  // Open gallery on tap/click
  function openGallery(index = 0) {
    currentImageIndex = index;
    resetZoomAndPosition();
    updateGallery();
    galleryModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  function closeGallery() {
    galleryModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    resetZoomAndPosition();
  }
  
  function updateGallery() {
    if (allImages.length > 0) {
      galleryMainImage.src = allImages[currentImageIndex];
      currentImageSpan.textContent = currentImageIndex + 1;
      
      // Update active thumbnail in modal
      galleryThumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (parseInt(thumb.getAttribute('data-index')) === currentImageIndex) {
          thumb.classList.add('active');
        }
      });
      
      // Update active thumbnail on main page
      const mainThumbnails = document.querySelectorAll('.thumbnail');
      mainThumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (parseInt(thumb.getAttribute('data-index')) === currentImageIndex) {
          thumb.classList.add('active');
          // Also update main image
          const mainImage = document.getElementById('mainImage');
          if (mainImage) {
            mainImage.src = allImages[currentImageIndex];
          }
        }
      });
    }
  }
  
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    resetZoomAndPosition();
    updateGallery();
  }
  
  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    resetZoomAndPosition();
    updateGallery();
  }
  
  function zoomIn() {
    if (zoomLevel < maxZoom) {
      zoomLevel += zoomStep;
      applyTransform();
    }
  }
  
  function zoomOut() {
    if (zoomLevel > minZoom) {
      zoomLevel -= zoomStep;
      applyTransform();
    }
  }
  
  function resetZoomAndPosition() {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }
  
  function applyTransform() {
    galleryMainImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
  }
  
  // Dragging functionality
  function startDrag(e) {
    if (zoomLevel <= 1) return; // Only drag when zoomed in
    
    isDragging = true;
    
    // Get starting position
    if (e.type === 'mousedown') {
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    } else if (e.type === 'touchstart') {
      const touch = e.touches[0];
      startX = touch.clientX - translateX;
      startY = touch.clientY - translateY;
    }
    
    // Change cursor to grab
    galleryImageContainer.style.cursor = 'grabbing';
    
    e.preventDefault();
  }
  
  function drag(e) {
    if (!isDragging || zoomLevel <= 1) return;
    
    let clientX, clientY;
    
    if (e.type === 'mousemove') {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.type === 'touchmove') {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }
    
    // Calculate new position
    translateX = clientX - startX;
    translateY = clientY - startY;
    
    // Apply limits to prevent dragging too far
    const maxTranslate = (zoomLevel - 1) * 100;
    translateX = Math.max(Math.min(translateX, maxTranslate), -maxTranslate);
    translateY = Math.max(Math.min(translateY, maxTranslate), -maxTranslate);
    
    applyTransform();
  }
  
  function stopDrag() {
    isDragging = false;
    galleryImageContainer.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
  }
  
  // Event Listeners
  galleryTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const thumb = trigger.closest('.thumbnail');
      if (thumb) {
        const index = parseInt(thumb.getAttribute('data-index'));
        openGallery(index);
      } else {
        openGallery(0);
      }
    });
  });
  
  if (closeGalleryBtn) {
    closeGalleryBtn.addEventListener('click', closeGallery);
  }
  
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
      closeGallery();
    }
  });
  
  if (prevBtn) {
    prevBtn.addEventListener('click', prevImage);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', nextImage);
  }
  
  galleryThumbnails.forEach(thumb => {
    thumb.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      currentImageIndex = index;
      resetZoomAndPosition();
      updateGallery();
    });
  });
  
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', zoomIn);
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', zoomOut);
  }
  
  if (resetZoomBtn) {
    resetZoomBtn.addEventListener('click', resetZoomAndPosition);
  }
  
  // Dragging event listeners
  galleryImageContainer.addEventListener('mousedown', startDrag);
  galleryImageContainer.addEventListener('mousemove', drag);
  galleryImageContainer.addEventListener('mouseup', stopDrag);
  galleryImageContainer.addEventListener('mouseleave', stopDrag);
  
  // Touch events for mobile
  galleryImageContainer.addEventListener('touchstart', startDrag);
  galleryImageContainer.addEventListener('touchmove', drag);
  galleryImageContainer.addEventListener('touchend', stopDrag);
  
  // Change cursor when zoomed
  galleryImageContainer.addEventListener('mouseenter', () => {
    if (zoomLevel > 1) {
      galleryImageContainer.style.cursor = 'grab';
    }
  });
  
  galleryImageContainer.addEventListener('mouseleave', () => {
    galleryImageContainer.style.cursor = 'default';
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!galleryModal.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeGallery();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case '+':
      case '=':
        if (!e.ctrlKey && !e.metaKey) {
          zoomIn();
        }
        break;
      case '-':
        if (!e.ctrlKey && !e.metaKey) {
          zoomOut();
        }
        break;
      case '0':
        resetZoomAndPosition();
        break;
    }
  });
  
  // Pinch to zoom for mobile
  let initialDistance = 0;
  
  galleryImageContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  });
  
  galleryImageContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleChange = currentDistance / initialDistance;
      
      if (scaleChange > 1.1) {
        zoomIn();
        initialDistance = currentDistance;
      } else if (scaleChange < 0.9) {
        zoomOut();
        initialDistance = currentDistance;
      }
    }
  });
}

function addProductDetailStyles() {
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
    
    /* Product Gallery */
    .product-gallery {
      margin-bottom: 30px;
    }
    
    .main-image {
      width: 100%;
      height: 400px;
      overflow: hidden;
      border-radius: var(--radius-lg);
      margin-bottom: 20px;
      position: relative;
    }
    
    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
      cursor: pointer;
    }
    
    .main-image img:hover {
      transform: scale(1.02);
    }
    
    .image-thumbnails {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 10px;
      scrollbar-width: thin;
    }
    
    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    
    .thumbnail:hover {
      border-color: var(--color-border);
      transform: translateY(-2px);
    }
    
    .thumbnail.active {
      border-color: var(--color-accent);
    }
    
    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
    
    /* Gallery Modal */
    .gallery-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      overflow: hidden;
    }
    
    .gallery-modal.active {
      display: block;
    }
    
    .gallery-modal-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--color-bg-primary);
    }
    
    .gallery-header {
      padding: 20px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-bg-card);
    }
    
    .gallery-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text-primary);
    }
    
    .close-gallery {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: 24px;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    .close-gallery:hover {
      background: var(--color-border);
      color: var(--color-text-primary);
    }
    
    .gallery-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .gallery-image-container {
      width: 100%;
      height: 100%;
      max-width: 800px;
      max-height: 600px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      position: relative;
    }
    
    #galleryMainImage {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.2s ease;
      transform-origin: center center;
      will-change: transform;
      user-select: none;
      -webkit-user-drag: none;
    }
    
    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 10;
    }
    
    .gallery-nav:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-50%) scale(1.1);
    }
    
    .gallery-nav.prev {
      left: 20px;
    }
    
    .gallery-nav.next {
      right: 20px;
    }
    
    .gallery-info {
      padding: 20px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-bg-card);
    }
    
    .image-counter {
      font-size: 1rem;
      color: var(--color-text-primary);
      font-weight: 600;
    }
    
    .gallery-actions {
      display: flex;
      gap: 10px;
    }
    
    .gallery-action-btn {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .gallery-action-btn:hover {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }
    
    .gallery-thumbnails {
      padding: 20px;
      display: flex;
      gap: 10px;
      overflow-x: auto;
      background: var(--color-bg-secondary);
      border-top: 1px solid var(--color-border);
    }
    
    .gallery-thumbnail {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    
    .gallery-thumbnail:hover {
      border-color: var(--color-border);
    }
    
    .gallery-thumbnail.active {
      border-color: var(--color-accent);
    }
    
    .gallery-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .main-image {
        height: 300px;
      }
      
      .product-image-placeholder {
        height: 300px;
      }
      
      .thumbnail {
        width: 60px;
        height: 60px;
      }
      
      .product-header h1 {
        font-size: 2rem;
      }
      
      .product-price {
        font-size: 1.75rem;
      }
      
      .gallery-nav {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
      
      .gallery-nav.prev {
        left: 10px;
      }
      
      .gallery-nav.next {
        right: 10px;
      }
      
      .gallery-thumbnail {
        width: 50px;
        height: 50px;
      }
      
      .gallery-image-container {
        cursor: grab;
      }
      
      #galleryMainImage {
        cursor: grab;
      }
    }
    
    @media (max-width: 480px) {
      .main-image {
        height: 250px;
      }
      
      .product-image-placeholder {
        height: 250px;
      }
      
      .thumbnail {
        width: 50px;
        height: 50px;
      }
      
      .product-header h1 {
        font-size: 1.75rem;
      }
      
      .product-price {
        font-size: 1.5rem;
      }
      
      .product-actions {
        flex-direction: column;
      }
      
      .gallery-header {
        padding: 15px;
      }
      
      .gallery-header h3 {
        font-size: 1rem;
      }
      
      .gallery-main {
        padding: 10px;
      }
      
      .gallery-info {
        padding: 15px;
        flex-direction: column;
        gap: 15px;
      }
      
      .gallery-actions {
        order: -1;
      }
      
      .gallery-thumbnails {
        padding: 15px;
      }
      
      .gallery-thumbnail {
        width: 40px;
        height: 40px;
      }
    }
    
    /* Touch-friendly improvements */
    @media (hover: none) and (pointer: coarse) {
      .thumbnail {
        min-width: 70px;
        min-height: 70px;
      }
      
      .gallery-image-container {
        cursor: grab;
      }
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