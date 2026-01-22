// UI Utilities
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  // Add loading state to buttons
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
      if (this.classList.contains('filter-btn')) {
        // Add active state to filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });

  // Search input clear button
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const container = this.closest('.search-container');
      if (!container) return;

      // Clear button functionality
      if (this.value && !container.querySelector('.search-clear')) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear';
        clearBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        `;
        clearBtn.type = 'button';
        clearBtn.ariaLabel = 'Clear search';
        clearBtn.style.cssText = `
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
        `;
        
        clearBtn.addEventListener('click', () => {
          this.value = '';
          this.focus();
          clearBtn.remove();
          // Trigger search update if needed
          this.dispatchEvent(new Event('input'));
        });
        
        container.appendChild(clearBtn);
      } else if (!this.value) {
        const clearBtn = container.querySelector('.search-clear');
        if (clearBtn) clearBtn.remove();
      }
    });
  }

  // Mobile menu toggle (for future expansion)
  const navList = document.querySelector('.nav-list');
  if (navList && window.innerWidth <= 768) {
    navList.addEventListener('scroll', function() {
      this.style.scrollbarWidth = 'thin';
    });
  }

  // Lazy loading for images
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // Add focus styles for accessibility
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
  });
});

// Keyboard navigation styles
.keyboard-nav *:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}