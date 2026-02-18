// API route for generating sitemap on Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const baseUrl = 'https://munastyles.com.ng';
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages - update these based on your actual pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily', lastmod: today },
      { url: '/shop.html', priority: '0.9', changefreq: 'daily', lastmod: today },
      { url: '/about.html', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { url: '/faq.html', priority: '0.7', changefreq: 'weekly', lastmod: today }
    ];
    
    // Note: For dynamic products, you would need to fetch from your database
    // Since we can't modify your backend, we'll use static pages only
    // You can enhance this later when you have a product API endpoint
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });
    
    xml += '</urlset>';
    
    // Set headers for XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    
    // Send the sitemap
    res.status(200).send(xml);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}