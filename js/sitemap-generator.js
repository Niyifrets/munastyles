// Client-side sitemap generator for Muna Styles
class SitemapGenerator {
  
  static async generateSitemap() {
    const baseUrl = 'https://munastyles.com.ng';
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticPages = [
      {
        url: '/',
        priority: '1.0',
        changefreq: 'daily',
        lastmod: today
      },
      {
        url: '/shop.html',
        priority: '0.9',
        changefreq: 'daily',
        lastmod: today
      },
      {
        url: '/about.html',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: today
      },
      {
        url: '/faq.html',
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: today
      }
    ];
    
    // Try to fetch products for dynamic sitemap
    let productPages = [];
    try {
      // This assumes your products are accessible via your existing API
      // Adjust based on your actual data structure
      const response = await fetch('/api/products?limit=100');
      if (response.ok) {
        const products = await response.json();
        productPages = products.map(product => ({
          url: `/product.html?id=${product.id}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: product.updatedAt || today
        }));
      }
    } catch (error) {
      console.log('Could not fetch products for sitemap:', error);
    }
    
    // Generate XML
    const allPages = [...staticPages, ...productPages];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    allPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    });
    
    xml += '</urlset>';
    
    return xml;
  }
  
  static async generateAndDownload() {
    try {
      const sitemap = await this.generateSitemap();
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Sitemap generated successfully');
    } catch (error) {
      console.error('Error generating sitemap:', error);
    }
  }
  
  // For admin panel use
  static async displayInAdmin() {
    try {
      const sitemap = await this.generateSitemap();
      const container = document.getElementById('sitemapContainer');
      if (container) {
        container.textContent = sitemap;
      }
      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return null;
    }
  }
}

// Make available globally
window.SitemapGenerator = SitemapGenerator;
