/**
 * Vue.js Adapter
 * Provides specific functionality for testing CSRF in Vue.js applications
 */

/**
 * Generate a Vue.js-specific CSRF test component
 * @param {Object} params - Test parameters
 * @returns {string} - Vue component code
 */
function generateTestComponent(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `
  <template>
    <div style="display: none">
      Vue.js CSRF Test Component
    </div>
  </template>
  
  <script>
  export default {
    name: 'CSRFTestComponent',
    mounted() {
      this.performCSRFTest();
    },
    methods: {
      async performCSRFTest() {
        try {
          // Try to extract CSRF token - Vue often stores it in a meta tag
          let csrfToken = null;
          const csrfMeta = document.querySelector('meta[name="csrf-token"]');
          
          if (csrfMeta) {
            csrfToken = csrfMeta.getAttribute('content');
          }
          
          // If not in meta, check for Vue's global properties
          if (!csrfToken && window.__INITIAL_STATE__) {
            csrfToken = window.__INITIAL_STATE__.csrf || null;
          }
          
          // If still not found, try cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('XSRF-TOKEN=') || 
                  cookie.startsWith('csrf=') ||
                  cookie.startsWith('X-CSRF-TOKEN=')) {
                csrfToken = cookie.split('=')[1];
                break;
              }
            }
          }
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
            // Vue apps with Laravel often use X-XSRF-TOKEN
            headers['X-XSRF-TOKEN'] = csrfToken;
          }
          
          const response = await fetch('${url}', {
            method: '${method}',
            headers,
            credentials: 'include',
            body: ${method !== 'GET' ? `JSON.stringify(${JSON.stringify(data)})` : 'undefined'}
          });
          
          console.log('Vue.js CSRF Test Response:', response.status);
        } catch (error) {
          console.error('Vue.js CSRF Test Error:', error);
        }
      }
    }
  }
  </script>`;
  }
  
  /**
   * Adapt request parameters for Vue.js applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for Vue.js
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // Vue applications typically use JSON for API requests via Axios
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // Vue often uses Axios, but we'll use fetch for CSRF tests
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'fetch';
    }
    
    // Check for common Vue.js CSRF token patterns
    if (!adaptedParams.csrfToken) {
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from Vue meta tags
          let csrfToken = null;
          const csrfMeta = document.querySelector('meta[name="csrf-token"]');
          
          if (csrfMeta) {
            csrfToken = csrfMeta.getAttribute('content');
          }
          
          // Check for Vue's global state if available
          if (!csrfToken && window.__INITIAL_STATE__) {
            csrfToken = window.__INITIAL_STATE__.csrf || null;
          }
          
          // Check for Laravel/Vue XSRF token in cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('XSRF-TOKEN=')) {
                csrfToken = decodeURIComponent(cookie.split('=')[1]);
                break;
              }
            }
          }
          
          return csrfToken;
        `
      };
    }
    
    // Add CSRF token to request headers if available
    if (adaptedParams.csrfToken && !adaptedParams.headers) {
      adaptedParams.headers = {
        'X-CSRF-Token': '${csrfToken}',
        'X-XSRF-TOKEN': '${csrfToken}' // Vue with Laravel often uses this header
      };
    }
    
    return adaptedParams;
  }
  
  /**
   * Analyze a Vue.js application to detect CSRF vulnerabilities
   * @param {string} url - URL of the Vue.js application
   * @returns {Promise<Object>} - Analysis results
   */
  async function analyzeVueApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if it's a Vue.js app
      const isVue = await page.evaluate(() => {
        return !!document.querySelector('[data-v-app]') || 
               !!window.__VUE__ || 
               !!window.__INITIAL_STATE__;
      });
      
      if (!isVue) {
        return {
          isVue: false,
          message: 'Not a Vue.js application'
        };
      }
      
      // Extract Vue version if available
      const vueVersion = await page.evaluate(() => {
        if (window.Vue && window.Vue.version) {
          return window.Vue.version;
        }
        return null;
      });
      
      // Check for CSRF protection
      const csrfProtection = await page.evaluate(() => {
        // Check for CSRF token in meta tag (common in Vue apps)
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfMetaToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
        
        // Check cookies for Laravel XSRF token (common with Vue)
        const csrfCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => 
            cookie.toLowerCase().includes('csrf') || 
            cookie.toLowerCase().includes('xsrf')
          );
        
        // Check for Vue's global state CSRF token
        let stateToken = null;
        if (window.__INITIAL_STATE__) {
          stateToken = window.__INITIAL_STATE__.csrf || null;
        }
        
        return {
          csrfMetaToken,
          csrfCookies,
          stateToken
        };
      });
      
      return {
        isVue: true,
        url,
        vueVersion,
        csrfProtection
      };
    } finally {
      await browser.close();
    }
  }
  
  // Export the Vue.js adapter functions
  module.exports = {
    adaptRequest,
    generateTestComponent,
    analyzeVueApp
  };