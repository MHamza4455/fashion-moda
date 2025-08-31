import { Component } from '@theme/component';
import { debounce } from '@theme/utilities';

/**
 * A custom element for inline search with dropdown suggestions.
 */
class InlineSearchComponent extends Component {
  requiredRefs = ['searchInput', 'searchResults', 'resetButton', 'dropdown', 'form', 'viewAllButton'];

  #controller = new AbortController();
  #activeFetch = null;
  #hideTimeout = null;

  connectedCallback() {
    super.connectedCallback();

    const { signal } = this.#controller;

    // Initialize search functionality
    this.refs.searchInput.addEventListener('input', this.#handleSearch, { signal });
    this.refs.searchInput.addEventListener('focus', this.#handleFocus, { signal });
    this.refs.searchInput.addEventListener('blur', this.#handleBlur, { signal });
    this.refs.searchInput.addEventListener('keydown', this.#handleKeyDown, { signal });
    
    this.refs.form.addEventListener('submit', this.#handleSubmit, { signal });
    this.refs.resetButton.addEventListener('click', this.#resetSearch, { signal });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.#handleOutsideClick, { signal });

    // Show/hide reset button based on input value
    if (this.refs.searchInput.value.length > 0) {
      this.#showResetButton();
    } else {
      this.#hideResetButton();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.abort();
    if (this.#hideTimeout) {
      clearTimeout(this.#hideTimeout);
    }
  }

  /**
   * Handle search input changes
   */
  #handleSearch = debounce((event) => {
    const query = event.target.value.trim();
    console.log('Search query:', query); // Debug log
    
    if (query.length > 0) {
      this.#showResetButton();
      this.#performSearch(query);
    } else {
      this.#hideResetButton();
      this.#hideDropdown();
    }
  }, 300);

  /**
   * Handle input focus
   */
  #handleFocus = () => {
    if (this.refs.searchInput.value.trim().length > 0) {
      this.#showDropdown();
    }
  };

  /**
   * Handle input blur with delay to allow for dropdown interaction
   */
  #handleBlur = () => {
    this.#hideTimeout = setTimeout(() => {
      this.#hideDropdown();
    }, 150);
  };

  /**
   * Handle clicks outside the component
   */
  #handleOutsideClick = (event) => {
    if (!this.contains(event.target)) {
      this.#hideDropdown();
    }
  };

  /**
   * Handle keyboard navigation
   */
  #handleKeyDown = (event) => {
    switch (event.key) {
      case 'Escape':
        this.#hideDropdown();
        this.refs.searchInput.blur();
        break;
      case 'Enter':
        if (!this.refs.dropdown.hidden) {
          // Let the form submit naturally
          return;
        }
        break;
    }
  };

  /**
   * Handle form submission
   */
  #handleSubmit = (event) => {
    const query = this.refs.searchInput.value.trim();
    if (!query) {
      event.preventDefault();
      return;
    }
    
    // Allow natural form submission to /search?q=query
    this.#hideDropdown();
  };

  /**
   * Perform predictive search using Shopify's suggest API
   */
  #performSearch = async (query) => {
    // Cancel any existing fetch
    if (this.#activeFetch) {
      this.#activeFetch.abort();
    }

    this.#activeFetch = new AbortController();
    
    try {
      // First try the suggest API
      let url = new URL(window.location.origin + '/search/suggest.json');
      url.searchParams.set('q', query);
      url.searchParams.set('resources[type]', 'product');
      url.searchParams.set('resources[limit]', '6');
      url.searchParams.set('resources[options][unavailable_products]', 'last');
      url.searchParams.set('resources[options][fields]', 'title,product_type,variants.title,vendor');

      let response = await fetch(url, {
        signal: this.#activeFetch.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If suggest API fails, try the regular search with section rendering
        console.log('Suggest API failed, trying section approach');
        url = new URL(window.location.origin + '/search');
        url.searchParams.set('q', query);
        url.searchParams.set('section_id', 'predictive-search');
        
        response = await fetch(url, {
          signal: this.#activeFetch.signal,
          headers: {
            'Accept': 'text/html',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        this.#renderResultsFromHTML(html, query);
        this.#showDropdown();
        return;
      }

      const data = await response.json();
      console.log('Search response:', data); // Debug log
      
      // Render search results
      this.#renderResults(data, query);
      this.#showDropdown();
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        this.#renderError();
        this.#showDropdown(); // Show error in dropdown
      }
    } finally {
      this.#activeFetch = null;
    }
  };

  /**
   * Fallback: Extract product information from the search results HTML
   */
  #renderResultsFromHTML = (html, query) => {
    // Create a temporary container to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Look for product elements - try multiple selectors
    let productElements = tempDiv.querySelectorAll('.predictive-search-product, .search-result-item, .product-item');
    
    if (productElements.length === 0) {
      // Try broader selectors
      productElements = tempDiv.querySelectorAll('[data-product-id], [data-product-url], .product-card, .search-result');
    }
    
    console.log('Found product elements:', productElements.length);
    
    if (productElements.length === 0) {
      this.refs.searchResults.innerHTML = `
        <div class="inline-search-no-results">
          <p>No products found for "${query}"</p>
        </div>
      `;
      this.refs.viewAllButton.style.display = 'none';
      return;
    }

    // Convert found products to our inline search format
    const productsHtml = Array.from(productElements).slice(0, 6).map(element => {
      const link = element.querySelector('a') || element.closest('a') || element;
      const img = element.querySelector('img');
      const titleElement = element.querySelector('.predictive-search-product__title, .product-title, .search-result-title, h3, h2, .product-card__title') || element;
      const priceElement = element.querySelector('.price, .product-price, .predictive-search-product__price');
      
      const url = link.getAttribute('href') || link.getAttribute('data-product-url') || '#';
      const imgSrc = img ? (img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-srcset')?.split(' ')[0]) : '';
      const titleText = titleElement.textContent?.trim() || 'Product';
      const priceText = priceElement ? priceElement.textContent?.trim() : '';

      return `
        <div class="inline-search-product">
          <a href="${url}" class="inline-search-product-link">
            ${imgSrc ? `
              <div class="inline-search-product-image">
                <img src="${imgSrc}" alt="${titleText}" width="40" height="40" loading="lazy">
              </div>
            ` : ''}
            <div class="inline-search-product-info">
              <div class="inline-search-product-title">${titleText}</div>
              ${priceText ? `<div class="inline-search-product-price">${priceText}</div>` : ''}
            </div>
          </a>
        </div>
      `;
    }).join('');

    this.refs.searchResults.innerHTML = `
      <div class="inline-search-products">
        ${productsHtml}
      </div>
    `;

    // Update view all button
    this.refs.viewAllButton.style.display = 'block';
    this.refs.viewAllButton.textContent = `View all results for "${query}"`;
  };

  /**
   * Render search results from Shopify's suggest API response
   */
  #renderResults = (data, query) => {
    const products = data.resources?.results?.products || [];
    console.log('Products found:', products.length); // Debug log
    
    if (products.length === 0) {
      this.refs.searchResults.innerHTML = `
        <div class="inline-search-no-results">
          <p>No products found for "${query}"</p>
        </div>
      `;
      this.refs.viewAllButton.style.display = 'none';
      return;
    }

    // Render product suggestions
    const productsHtml = products.map(product => {
      const imageUrl = product.featured_image ? 
        product.featured_image.url + '&width=80' : 
        '';
      const price = product.price ? this.#formatPrice(product.price) : '';
      
      return `
        <div class="inline-search-product">
          <a href="${product.url}" class="inline-search-product-link">
            ${imageUrl ? `
              <div class="inline-search-product-image">
                <img src="${imageUrl}" alt="${product.featured_image?.alt || product.title}" width="40" height="40" loading="lazy">
              </div>
            ` : ''}
            <div class="inline-search-product-info">
              <div class="inline-search-product-title">${product.title}</div>
              ${price ? `<div class="inline-search-product-price">${price}</div>` : ''}
            </div>
          </a>
        </div>
      `;
    }).join('');

    this.refs.searchResults.innerHTML = `
      <div class="inline-search-products">
        ${productsHtml}
      </div>
    `;

    // Update view all button
    this.refs.viewAllButton.style.display = 'block';
    this.refs.viewAllButton.textContent = `View all results for "${query}"`;
  };

  /**
   * Format price (handles Shopify price format)
   */
  #formatPrice = (price) => {
    if (typeof price === 'number') {
      // Handle price in cents
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(price / 100);
    }
    if (typeof price === 'string') {
      // If it's already formatted, return as-is
      return price;
    }
    return ''; // Return empty string if price is undefined
  };

  /**
   * Render error state
   */
  #renderError = () => {
    this.refs.searchResults.innerHTML = `
      <div class="inline-search-error">
        <p>Search is temporarily unavailable. Please try again.</p>
      </div>
    `;
    this.refs.viewAllButton.style.display = 'none';
  };

  /**
   * Show the dropdown
   */
  #showDropdown = () => {
    if (this.#hideTimeout) {
      clearTimeout(this.#hideTimeout);
      this.#hideTimeout = null;
    }
    
    this.refs.dropdown.hidden = false;
    this.refs.searchInput.setAttribute('aria-expanded', 'true');
  };

  /**
   * Hide the dropdown
   */
  #hideDropdown = () => {
    this.refs.dropdown.hidden = true;
    this.refs.searchInput.setAttribute('aria-expanded', 'false');
  };

  /**
   * Show the reset button
   */
  #showResetButton = () => {
    if (this.refs.resetButton) {
      this.refs.resetButton.style.display = 'flex';
    }
  };

  /**
   * Hide the reset button
   */
  #hideResetButton = () => {
    if (this.refs.resetButton) {
      this.refs.resetButton.style.display = 'none';
    }
  };

  /**
   * Reset the search
   */
  #resetSearch = () => {
    this.refs.searchInput.value = '';
    this.#hideResetButton();
    this.#hideDropdown();
    this.refs.searchInput.focus();
  };
}

customElements.define('inline-search-component', InlineSearchComponent);
