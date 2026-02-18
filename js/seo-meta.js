// SEO Meta Tags Manager for Muna Styles
class SEOMetaManager {
  
  // Default meta configuration
  static defaultMeta = {
    title: 'Muna Styles | Premium Fashion & Décor in Nigeria',
    description: 'Shop premium bags, kiddies fashion, interior décor, and shoes in Nigeria. Quality craftsmanship, nationwide delivery.',
    keywords: 'bags Nigeria, kiddies fashion Lagos, interior décor, premium shoes, Nigerian fashion store',
    image: 'https://munastyles.com.ng/images/og-image.jpg',
    url: 'https://munastyles.com.ng',
    type: 'website',
    siteName: 'Muna Styles',
    locale: 'en_NG',
    twitterCard: 'summary_large_image',
    twitterSite: '@munastyles'
  };
  
  // Update page title
  static updateTitle(title) {
    document.title = title;
    this.updateMetaTag('property', 'og:title', title);
    this.updateMetaTag('name', 'twitter:title', title);
  }
  
  // Update meta description
  static updateDescription(description) {
    this.updateMetaTag('name', 'description', description);
    this.updateMetaTag('property', 'og:description', description);
    this.updateMetaTag('name', 'twitter:description', description);
  }
  
  // Update meta keywords
  static updateKeywords(keywords) {
    this.updateMetaTag('name', 'keywords', keywords);
  }
  
  // Update canonical URL
  static updateCanonical(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }
  
  // Update Open Graph image
  static updateImage(imageUrl) {
    this.updateMetaTag('property', 'og:image', imageUrl);
    this.updateMetaTag('property', 'og:image:secure_url', imageUrl);
    this.updateMetaTag('name', 'twitter:image', imageUrl);
  }
  
  // Update Open Graph URL
  static updateURL(url) {
    this.updateMetaTag('property', 'og:url', url);
    this.updateMetaTag('name', 'twitter:url', url);
  }
  
  // Helper method to update/create meta tags
  static updateMetaTag(attr, attrValue, content) {
    let meta = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, attrValue);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
  
  // Initialize meta tags for a specific page
  static initPage(pageType, customData = {}) {
    const data = { ...this.defaultMeta, ...customData };
    
    this.updateTitle(data.title);
    this.updateDescription(data.description);
    this.updateKeywords(data.keywords);
    this.updateCanonical(data.url);
    this.updateImage(data.image);
    this.updateURL(data.url);
    
    this.updateMetaTag('property', 'og:type', data.type);
    this.updateMetaTag('property', 'og:site_name', data.siteName);
    this.updateMetaTag('property', 'og:locale', data.locale);
    
    this.updateMetaTag('name', 'twitter:card', data.twitterCard);
    this.updateMetaTag('name', 'twitter:site', data.twitterSite);
    
    this.addAdditionalMetaTags();
  }
  
  // Add additional important meta tags
  static addAdditionalMetaTags() {
    const additionalTags = [
      { name: 'author', content: 'Muna Styles' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'bingbot', content: 'index, follow' },
      { name: 'geo.region', content: 'NG-LA' },
      { name: 'geo.placename', content: 'Lagos' },
      { name: 'geo.position', content: '6.524379;3.379206' },
      { name: 'ICBM', content: '6.524379, 3.379206' },
      { 'http-equiv': 'content-language', content: 'en' }
    ];
    
    additionalTags.forEach(tag => {
      if (tag.name) {
        this.updateMetaTag('name', tag.name, tag.content);
      } else if (tag['http-equiv']) {
        let meta = document.querySelector(`meta[http-equiv="${tag['http-equiv']}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('http-equiv', tag['http-equiv']);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', tag.content);
      }
    });
  }
  
  // Initialize for home page
  static initHomePage() {
    this.initPage('home', {
      title: 'Muna Styles | Premium Bags, Kiddies Fashion & Interior Décor in Nigeria',
      description: 'Shop premium bags, stylish kiddies fashion, elegant interior décor, and trendy shoes in Nigeria. Quality products with nationwide delivery.',
      keywords: 'bags Nigeria, kiddies clothes Lagos, interior decoration, shoes online, fashion store Nigeria, premium handbags',
      url: 'https://munastyles.com.ng/'
    });
  }
  
  // Initialize for shop page
  static initShopPage() {
    this.initPage('shop', {
      title: 'Shop All Products | Muna Styles Nigeria',
      description: 'Browse our full collection of premium bags, kiddies fashion, interior décor, and shoes. Free shipping available nationwide in Nigeria.',
      keywords: 'buy bags online Nigeria, kids fashion Lagos, home décor, leather shoes, online shopping Nigeria',
      url: 'https://munastyles.com.ng/shop.html'
    });
  }
  
  // Initialize for about page
  static initAboutPage() {
    this.initPage('about', {
      title: 'About Muna Styles | Premium Fashion Store Nigeria',
      description: 'Discover Muna Styles - your premium fashion and interior décor store in Nigeria. Quality products with excellent customer service.',
      keywords: 'about Muna Styles, fashion store Nigeria, premium quality, Nigerian business',
      url: 'https://munastyles.com.ng/about.html'
    });
  }
  
  // Initialize for FAQ page
  static initFAQPage() {
    this.initPage('faq', {
      title: 'FAQ | Frequently Asked Questions | Muna Styles Nigeria',
      description: 'Find answers to common questions about ordering, delivery, payments, and products at Muna Styles Nigeria.',
      keywords: 'FAQ Muna Styles, questions, delivery Nigeria, payment methods, returns policy',
      url: 'https://munastyles.com.ng/faq.html'
    });
  }
  
  // Initialize for product page
  static initProductPage(product) {
    const title = `${product.name} | ${product.category} | Muna Styles Nigeria`;
    const description = `Buy ${product.name} - Premium ${product.category} from Muna Styles. ${product.description || 'Quality product with nationwide delivery in Nigeria.'}`;
    const keywords = `${product.name} Nigeria, buy ${product.category} Lagos, ${product.category} online Nigeria, Muna Styles`;
    const url = `https://munastyles.com.ng/product.html?id=${product.id}`;
    
    this.initPage('product', {
      title: title,
      description: description,
      keywords: keywords,
      url: url,
      image: product.imageUrl || 'https://munastyles.com.ng/images/og-image.jpg',
      type: 'product'
    });
  }
}

// Make available globally
window.SEOMetaManager = SEOMetaManager;
