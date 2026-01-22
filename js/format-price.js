// SAFE: Only formats numbers for display, doesn't modify backend data
// This function adds commas to prices (e.g., 15000 becomes 15,000)
window.formatPrice = function(price) {
  if (price === undefined || price === null) return '₦0';
  
  // Convert to number if it's a string
  const num = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN
  if (isNaN(num)) return '₦0';
  
  // Format with commas
  return '₦' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Optional: For displaying item totals with proper formatting
window.formatItemTotal = function(price, quantity) {
  const total = price * quantity;
  return window.formatPrice(total);
};