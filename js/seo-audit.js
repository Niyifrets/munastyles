// SEO Audit Tool for Muna Styles
class SEOAudit {
  
  static runAudit() {
    const issues = [];
    const warnings = [];
    const passed = [];
    
    // 1. Check Title
    const title = document.title;
    if (!title) {
      issues.push('Missing page title');
    } else {
      if (title.length < 30) {
        warnings.push(`Title is too short (${title.length} chars). Aim for 30-60 characters.`);
      } else if (title.length > 60) {
        warnings.push(`Title is too long (${title.length} chars). Aim for 30-60 characters.`);
      } else {
        passed.push(`Title length is good (${title.length} chars)`);
      }
    }
    
    // 2. Check Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.content) {
      issues.push('Missing meta description');
    } else {
      const descLength = metaDesc.content.length;
      if (descLength < 120) {
        warnings.push(`Meta description is too short (${descLength} chars). Aim for 120-160 characters.`);
      } else if (descLength > 160) {
        warnings.push(`Meta description is too long (${descLength} chars). Aim for 120-160 characters.`);
      } else {
        passed.push(`Meta description length is good (${descLength} chars)`);
      }
    }
    
    // 3. Check H1 Tags
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      issues.push('Missing H1 tag');
    } else if (h1s.length > 1) {
      warnings.push(`Multiple H1 tags found (${h1s.length}). Should have only one.`);
    } else {
      passed.push('H1 tag is present and unique');
    }
    
    // 4. Check Images for Alt Text
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!img.alt && !img.hasAttribute('aria-hidden') && !img.classList.contains('decorative')) {
        imagesWithoutAlt++;
      }
    });
    
    if (imagesWithoutAlt > 0) {
      warnings.push(`${imagesWithoutAlt} image(s) missing alt text`);
    } else if (images.length > 0) {
      passed.push('All images have alt text');
    }
    
    // 5. Check Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      warnings.push('Missing canonical URL');
    } else {
      passed.push('Canonical URL is set');
    }
    
    // 6. Check Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    
    if (!ogTitle) warnings.push('Missing Open Graph title');
    if (!ogDesc) warnings.push('Missing Open Graph description');
    if (!ogImage) warnings.push('Missing Open Graph image');
    if (!ogUrl) warnings.push('Missing Open Graph URL');
    
    if (ogTitle && ogDesc && ogImage && ogUrl) {
      passed.push('Open Graph tags are complete');
    }
    
    // 7. Check Structured Data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length === 0) {
      warnings.push('No structured data found');
    } else {
      passed.push(`${structuredData.length} structured data block(s) found`);
    }
    
    // 8. Check Mobile Viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push('Missing viewport meta tag (critical for mobile)');
    } else {
      passed.push('Viewport meta tag is set');
    }
    
    // 9. Check Page Speed Indicators
    const largeImages = [];
    images.forEach(img => {
      if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
        largeImages.push(img.src);
      }
    });
    
    if (largeImages.length > 0) {
      warnings.push(`${largeImages.length} large image(s) detected (may affect page speed)`);
    }
    
    // 10. Check Internal Links
    const internalLinks = Array.from(document.querySelectorAll('a')).filter(a => {
      const href = a.getAttribute('href');
      return href && (href.startsWith('/') || href.includes('munastyles.com.ng'));
    });
    
    if (internalLinks.length === 0) {
      warnings.push('No internal links found');
    } else {
      passed.push(`${internalLinks.length} internal link(s) found`);
    }
    
    return {
      issues,
      warnings,
      passed,
      score: this.calculateScore(issues.length, warnings.length, passed.length)
    };
  }
  
  static calculateScore(issues, warnings, passed) {
    const total = issues + warnings + passed;
    if (total === 0) return 0;
    
    // Weight: issues = -3, warnings = -1, passed = +2
    const score = (passed * 2) - warnings - (issues * 3);
    const maxScore = total * 2;
    const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100));
    
    return Math.round(percentage);
  }
  
  static displayResults() {
    const audit = this.runAudit();
    
    console.group('🔍 Muna Styles SEO Audit Results');
    console.log(`📊 Overall Score: ${audit.score}/100`);
    
    if (audit.issues.length > 0) {
      console.group('❌ Critical Issues:');
      audit.issues.forEach(issue => console.log(`- ${issue}`));
      console.groupEnd();
    }
    
    if (audit.warnings.length > 0) {
      console.group('⚠️  Warnings:');
      audit.warnings.forEach(warning => console.log(`- ${warning}`));
      console.groupEnd();
    }
    
    if (audit.passed.length > 0) {
      console.group('✅ Passed Checks:');
      audit.passed.forEach(pass => console.log(`- ${pass}`));
      console.groupEnd();
    }
    
    console.groupEnd();
    
    // For admin panel
    if (typeof window !== 'undefined' && window.location.pathname.includes('admin')) {
      this.displayInAdminPanel(audit);
    }
    
    return audit;
  }
  
  static displayInAdminPanel(audit) {
    const container = document.getElementById('seoAuditResults');
    if (!container) return;
    
    let html = `
      <div class="seo-audit-results">
        <h3>SEO Audit Results</h3>
        <div class="seo-score" style="
          font-size: 24px;
          font-weight: bold;
          color: ${audit.score >= 80 ? 'green' : audit.score >= 60 ? 'orange' : 'red'};
          margin-bottom: 20px;
        ">
          Score: ${audit.score}/100
        </div>
    `;
    
    if (audit.issues.length > 0) {
      html += `
        <div class="seo-section issues">
          <h4>❌ Critical Issues (${audit.issues.length})</h4>
          <ul>
            ${audit.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (audit.warnings.length > 0) {
      html += `
        <div class="seo-section warnings">
          <h4>⚠️  Warnings (${audit.warnings.length})</h4>
          <ul>
            ${audit.warnings.map(warning => `<li>${warning}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (audit.passed.length > 0) {
      html += `
        <div class="seo-section passed">
          <h4>✅ Passed Checks (${audit.passed.length})</h4>
          <ul>
            ${audit.passed.map(pass => `<li>${pass}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    html += `</div>`;
    container.innerHTML = html;
  }
  
  // Run audit automatically in development
  static init() {
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel')) {
      setTimeout(() => {
        this.displayResults();
      }, 2000);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  SEOAudit.init();
});

// Make available globally
window.SEOAudit = SEOAudit;
