// Professional WhatsApp Service without browser popups
class WhatsAppService {
  constructor() {
    this.number = '2348131553154';
    this.init();
  }
  
  init() {
    // Setup when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    this.setupWhatsAppLinks();
    this.setupCartCheckout();
    this.injectToastStyles();
  }
  
  setupWhatsAppLinks() {
    // Setup all WhatsApp links with data-message attribute
    document.querySelectorAll('[data-whatsapp]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const message = link.getAttribute('data-message') || 
                       'Hello Muna Styles, I would like to inquire about your products';
        this.sendMessage(message);
      });
    });
    
    // Setup regular WhatsApp links
    document.querySelectorAll('a[href*="whatsapp"]').forEach(link => {
      if (!link.hasAttribute('data-whatsapp')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          const url = new URL(href);
          const text = url.searchParams.get('text') || 
                      'Hello Muna Styles, I would like to inquire about your products';
          this.sendMessage(decodeURIComponent(text));
        });
      }
    });
  }
  
  setupCartCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendCartOrder();
      });
    }
  }
  
  sendMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    
    // Create and click a link - NO POPUP WARNING
    const link = document.createElement('a');
    link.href = `https://wa.me/${this.number}?text=${encodedMessage}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  sendCartOrder() {
    const cart = JSON.parse(localStorage.getItem('muna_cart')) || [];
    if (cart.length === 0) {
      this.showToast('Your cart is empty! Add some products first.', 'error');
      return;
    }
    
    // Show confirmation modal
    this.showOrderConfirmation(cart);
  }
  
  showOrderConfirmation(cart) {
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'order-confirmation-modal';
    modal.innerHTML = `
      <div class="order-confirmation-content">
        <div class="order-confirmation-header">
          <h3><i class="fas fa-shopping-cart"></i> Confirm Your Order</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <div class="order-items-list">
          ${cart.map(item => `
            <div class="order-item-row">
              <div class="order-item-info">
                <strong>${item.name}</strong>
                <small>${formatPrice(item.price)} × ${item.qty}</small>
              </div>
              <div class="order-item-total">${formatPrice(item.price * item.qty)}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="order-summary">
          <div class="order-total-row">
            <span>Total Amount:</span>
            <strong>${formatPrice(total)}</strong>
          </div>
          <p class="order-note">Your order will be sent via WhatsApp to our team for processing.</p>
        </div>
        
        <div class="order-actions">
          <button class="btn-secondary cancel-order">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="btn-primary confirm-order">
            <i class="fab fa-whatsapp"></i> Send Order via WhatsApp
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
    modal.querySelector('.cancel-order').addEventListener('click', () => this.closeModal(modal));
    
    modal.querySelector('.confirm-order').addEventListener('click', () => {
      this.processOrder(cart);
      this.closeModal(modal);
      
      // Close cart modal if open
      const cartModal = document.getElementById('cartModal');
      if (cartModal) {
        cartModal.classList.remove('active');
      }
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
  }
  
  processOrder(cart) {
    let message = "🛍️ *NEW ORDER - Muna Styles*\n\n";
    message += "Hello! I would like to place an order:\n\n";
    
    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      message += `• ${item.name}\n`;
      message += `  Quantity: ${item.qty}\n`;
      message += `  Price: ${formatPrice(itemTotal)}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    message += `*Total: ${formatPrice(total)}*\n\n`;
    message += "Please let me know:\n";
    message += "1. Payment details\n";
    message += "2. Delivery timeline\n";
    message += "3. Any additional information needed\n\n";
    message += "Thank you!";
    
    this.sendMessage(message);
    
    // Show success message
    this.showToast('Order sent successfully via WhatsApp!', 'success');
    
    // Optional: Clear cart after order
    // localStorage.removeItem('muna_cart');
    // updateCartCount();
  }
  
  closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
  
  injectToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: var(--color-bg-card);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateY(100%);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10001;
        max-width: 400px;
        pointer-events: none;
      }
      
      .toast.show {
        transform: translateY(0);
        opacity: 1;
      }
      
      .toast-success {
        border-left: 4px solid #25D366;
      }
      
      .toast-error {
        border-left: 4px solid #e74c3c;
      }
      
      .toast i {
        font-size: 20px;
      }
      
      .toast-success i {
        color: #25D366;
      }
      
      .toast-error i {
        color: #e74c3c;
      }
      
      .order-confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2001;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        padding: 20px;
      }
      
      .order-confirmation-modal.active {
        opacity: 1;
        visibility: visible;
      }
      
      .order-confirmation-content {
        background: var(--color-bg-card);
        border-radius: var(--radius-lg);
        padding: 30px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
        transform: translateY(20px);
        transition: transform 0.3s ease;
      }
      
      .order-confirmation-modal.active .order-confirmation-content {
        transform: translateY(0);
      }
      
      .order-confirmation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border);
      }
      
      .order-confirmation-header h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.5rem;
        color: var(--color-text-primary);
      }
      
      .order-confirmation-header .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 5px;
        line-height: 1;
      }
      
      .order-items-list {
        margin-bottom: 24px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .order-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border);
      }
      
      .order-item-row:last-child {
        border-bottom: none;
      }
      
      .order-item-info {
        flex: 1;
      }
      
      .order-item-info strong {
        display: block;
        margin-bottom: 4px;
        color: var(--color-text-primary);
      }
      
      .order-item-info small {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
      }
      
      .order-item-total {
        font-weight: 600;
        color: var(--color-accent);
      }
      
      .order-summary {
        padding: 20px;
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        margin-bottom: 24px;
      }
      
      .order-total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.25rem;
        margin-bottom: 12px;
      }
      
      .order-note {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        margin-top: 12px;
        text-align: center;
      }
      
      .order-actions {
        display: flex;
        gap: 12px;
      }
      
      .order-actions button {
        flex: 1;
        padding: 14px;
        border: none;
        border-radius: var(--radius-md);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 1rem;
      }
      
      .btn-secondary {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
      }
      
      .btn-primary {
        background: #25D366;
        color: white;
      }
      
      .btn-secondary:hover {
        background: var(--color-border);
      }
      
      .btn-primary:hover {
        background: #128C7E;
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
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
  }
}

// Initialize WhatsApp service
const whatsappService = new WhatsAppService();