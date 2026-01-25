const CART_KEY = "muna_cart";

/* ======================
   GET / SAVE CART
====================== */
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* ======================
   ADD TO CART
====================== */
export function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  alert("Added to cart");
}

/* ======================
   UPDATE QTY
====================== */
export function updateQty(id, change) {
  let cart = getCart();

  cart = cart.map(item => {
    if (item.id === id) {
      item.qty += change;
      if (item.qty < 1) item.qty = 1;
    }
    return item;
  });

  saveCart(cart);
}

/* ======================
   REMOVE ITEM
====================== */
export function removeItem(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
}

/* ======================
   CART COUNT
====================== */
export function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count;
}

export function getCartItems() {
  return getCart();
}