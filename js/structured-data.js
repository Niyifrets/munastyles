// Structured Data Generator for Muna Styles SEO
class StructuredDataGenerator {
  
  // Generate website structured data
  static generateWebsite() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Muna Styles",
      "url": "https://munastyles.com.ng",
      "description": "Premium fashion and interior décor store in Nigeria",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://munastyles.com.ng/shop.html?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  }
  
  // Generate organization/business structured data
  static generateOrganization() {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Muna Styles",
      "image": "https://munastyles.com.ng/images/logo.png",
      "@id": "https://munastyles.com.ng",
      "url": "https://munastyles.com.ng",
      "telephone": "+2348131553154",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Lagos",
        "addressLocality": "Lagos",
        "addressRegion": "Lagos",
        "postalCode": "NG",
        "addressCountry": "NG"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 6.524379,
        "longitude": 3.379206
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "10:00",
          "closes": "16:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "12:00",
          "closes": "16:00"
        }
      ],
      "priceRange": "₦₦",
      "sameAs": [
        "https://facebook.com/munastyles",
        "https://instagram.com/munastyles",
        "https://twitter.com/munastyles"
      ]
    };
  }
  
  // Generate product structured data
  static generateProduct(productData) {
    const data = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.name || "Product",
      "description": productData.description || "Premium product from Muna Styles Nigeria",
      "image": productData.imageUrl || "https://munastyles.com.ng/images/logo.png",
      "sku": productData.id || "MS001",
      "mpn": productData.id || "MS001",
      "brand": {
        "@type": "Brand",
        "name": "Muna Styles"
      },
      "offers": {
        "@type": "Offer",
        "url": productData.url || "https://munastyles.com.ng/shop.html",
        "priceCurrency": "NGN",
        "price": productData.price || 0,
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Muna Styles"
        }
      }
    };
    
    // Add category if available
    if (productData.category) {
      data.category = productData.category;
    }
    
    return data;
  }
  
  // Generate breadcrumb structured data
  static generateBreadcrumb(pageTitle, pageUrl) {
    const baseUrl = "https://munastyles.com.ng";
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl + "/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": pageTitle,
          "item": baseUrl + pageUrl
        }
      ]
    };
  }
  
  // Generate FAQ structured data
  static generateFAQ() {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I place an order?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can place orders via WhatsApp (+234 813 155 3154) or by browsing our online catalog and contacting us directly through the product pages."
          }
        },
        {
          "@type": "Question",
          "name": "What payment methods do you accept?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We accept bank transfers, USSD payments, and POS payments upon delivery for customers in Nigeria."
          }
        },
        {
          "@type": "Question",
          "name": "How long does delivery take in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lagos: 24-48 hours, Major cities: 3-5 days, Nationwide: 5-7 business days."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer returns or exchanges?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we accept returns within 7 days for unused items in original packaging. Custom items cannot be returned."
          }
        }
      ]
    };
  }
  
  // Insert structured data into page
  static insertStructuredData(data) {
    // Remove any existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.textContent.includes('schema.org')) {
        script.remove();
      }
    });
    
    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    
    // Insert into head
    document.head.appendChild(script);
  }
  
  // Initialize structured data for current page
  static init(pageType = 'home', productData = null) {
    // Always add website and organization data
    this.insertStructuredData(this.generateWebsite());
    this.insertStructuredData(this.generateOrganization());
    
    // Add page-specific structured data
    switch(pageType) {
      case 'product':
        if (productData) {
          this.insertStructuredData(this.generateProduct(productData));
        }
        break;
      case 'faq':
        this.insertStructuredData(this.generateFAQ());
        break;
      case 'shop':
        // Add breadcrumb for shop
        this.insertStructuredData(this.generateBreadcrumb('Shop All', '/shop.html'));
        break;
      case 'about':
        this.insertStructuredData(this.generateBreadcrumb('About Us', '/about.html'));
        break;
    }
  }
}

// Make available globally
window.StructuredDataGenerator = StructuredDataGenerator;
