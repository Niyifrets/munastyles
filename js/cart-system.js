// Cart System for all pages
const CART_KEY = "muna_cart";

// Update cart count on all pages
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = count;
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);