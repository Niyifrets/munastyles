// Client-side sitemap generator for Muna Styles
class SitemapGenerator {
  
  static async generateFullSitemap() {
    const baseUrl = 'https://munastyles.com.ng';
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily', lastmod: today },
      { url: '/shop.html', priority: '0.9', changefreq: 'daily', lastmod: today },
      { url: '/about.html', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { url: '/faq.html', priority: '0.7', changefreq: 'weekly', lastmod: today },
      { url: '/shop.html?category=bags', priority: '0.6', changefreq: 'weekly', lastmod: today },
      { url: '/shop.html?category=kiddies', priority: '0.6', changefreq: 'weekly', lastmod: today },
      { url: '/shop.html?category=interior', priority: '0.6', changefreq: 'weekly', lastmod: today },
      { url: '/shop.html?category=shoes', priority: '0.6', changefreq: 'weekly', lastmod: today }
    ];
    
    // Try to fetch products for dynamic URLs
    let productPages = [];
    
    try {
      // Check if products are available globally
      if (window.allProducts && window.allProducts.length > 0) {
        productPages = window.allProducts.map(product => ({
          url: `/product.html?id=${product.id}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: product.updatedAt || today
        }));
      } else {
        // Try to get from localStorage
        const cachedProducts = localStorage.getItem('muna_products_cache');
        if (cachedProducts) {
          const products = JSON.parse(cachedProducts);
          productPages = products.map(product => ({
            url: `/product.html?id=${product.id}`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: today
          }));
        }
      }
    } catch (error) {
      console.log('Could not fetch products for sitemap:', error);
    }
    
    // Combine all pages
    const allPages = [...staticPages, ...productPages];
    
    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
    
    allPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });
    
    xml += '</urlset>';
    
    return xml;
  }
  
  static async downloadSitemap() {
    try {
      const sitemap = await this.generateFullSitemap();
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Sitemap downloaded successfully!');
      return true;
    } catch (error) {
      console.error('Error downloading sitemap:', error);
      alert('Error generating sitemap. Please try again.');
      return false;
    }
  }
  
  static async submitToSearchEngines() {
    const searchEngines = [
      `https://www.google.com/ping?sitemap=https://munastyles.com.ng/sitemap.xml`,
      `https://www.bing.com/ping?sitemap=https://munastyles.com.ng/sitemap.xml`
    ];
    
    searchEngines.forEach(url => {
      window.open(url, '_blank');
    });
  }
  
  static async previewSitemap() {
    try {
      const sitemap = await this.generateFullSitemap();
      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return null;
    }
  }
}

// Make available globally
window.SitemapGenerator = SitemapGenerator;
