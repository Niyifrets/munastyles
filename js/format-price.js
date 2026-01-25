// Professional Price Formatting
window.formatPrice = function(price) {
  if (price === undefined || price === null || isNaN(price)) {
    return '₦0';
  }
  
  // Convert to number
  const num = typeof price === 'string' ? parseFloat(price) : Number(price);
  
  // Format with commas
  const parts = Math.round(num).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return '₦' + parts.join('.');
};

// For console debugging
console.log('Price formatter loaded successfully');