// API route for generating dynamic sitemap on Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const baseUrl = 'https://munastyles.com.ng';
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages with their details
    const staticPages = [
      {
        url: '/',
        priority: '1.0',
        changefreq: 'daily',
        lastmod: today,
        images: [
          {
            loc: '/images/logo.png',
            title: 'Muna Styles Logo - Premium Fashion Nigeria',
            caption: 'Muna Styles - Premium Fashion & Décor Store in Nigeria'
          }
        ]
      },
      {
        url: '/shop.html',
        priority: '0.9',
        changefreq: 'daily',
        lastmod: today,
        images: []
      },
      {
        url: '/about.html',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: today,
        images: []
      },
      {
        url: '/faq.html',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: today,
        images: []
      },
      {
        url: '/shop.html?category=bags',
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: today,
        images: []
      },
      {
        url: '/shop.html?category=kiddies',
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: today,
        images: []
      },
      {
        url: '/shop.html?category=interior',
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: today,
        images: []
      },
      {
        url: '/shop.html?category=shoes',
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: today,
        images: []
      }
    ];
    
    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;
    
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
      
      // Add image tags if any
      if (page.images && page.images.length > 0) {
        page.images.forEach(img => {
          xml += `
    <image:image>
      <image:loc>${baseUrl}${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>`;
        });
      }
      
      xml += `
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
