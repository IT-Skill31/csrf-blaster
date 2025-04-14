/**
 * Nuxt.js Adapter
 * Provides specific functionality for testing CSRF in Nuxt.js applications
 */

/**
 * Generate a Nuxt.js-specific CSRF test component
 * @param {Object} params - Test parameters
 * @returns {string} - Nuxt component code
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
      Nuxt.js CSRF Test Component
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
          // Try to extract CSRF token from Nuxt.js app
          let csrfToken = null;
          
          // Nuxt stores state in window.__NUXT__
          if (window.__NUXT__) {
            // Look for CSRF token in Nuxt state
            csrfToken = window.__NUXT__.state?.csrf || 
                       window.__NUXT__.state?.token ||
                       null;
          }
          
          // Nuxt often uses meta tags for CSRF tokens
          if (!csrfToken) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            if (csrfMeta) {
              csrfToken = csrfMeta.getAttribute('content');
            }
          }
          
          // If still not found, check cookies (common with Nuxt + Express)
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('csrf=') || 
                  cookie.startsWith('XSRF-TOKEN=') ||
                  cookie.startsWith('_csrf=')) {
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
            // Nuxt apps with Express often use this header
            headers['CSRF-Token'] = csrfToken;
          }
          
          const response = await fetch('${url}', {
            method: '${method}',
            headers,
            credentials: 'include',
            body: ${method !== 'GET' ? `JSON.stringify(${JSON.stringify(data)})` : 'undefined'}
          });
          
          console.log('Nuxt.js CSRF Test Response:', response.status);
        } catch (error) {
          console.error('Nuxt.js CSRF Test Error:', error);
        }
      }
    }
  }
  </script>`;
  }
  
  /**
   * Adapt request parameters for Nuxt.js applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for Nuxt.js
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // Nuxt applications typically use JSON for API requests
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // Nuxt.js often uses Axios by default, but we'll use fetch for CSRF tests
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'fetch';
    }
    
    // Check for common Nuxt.js CSRF token patterns
    if (!adaptedParams.csrfToken) {
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from Nuxt.js state
          let csrfToken = null;
          
          // Check Nuxt state
          if (window.__NUXT__) {
            csrfToken = window.__NUXT__.state?.csrf || 
                       window.__NUXT__.state?.token ||
                       null;
          }
          
          // Check meta tags
          if (!csrfToken) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            if (csrfMeta) {
              csrfToken = csrfMeta.getAttribute('content');
            }
          }
          
          // Check cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('csrf=') || 
                  cookie.startsWith('XSRF-TOKEN=') ||
                  cookie.startsWith('_csrf=')) {
                csrfToken = cookie.split('=')[1];
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
        'CSRF-Token': '${csrfToken}' // Nuxt with Express often uses this
      };
    }
    
    return adaptedParams;
  }
  
  /**
   * Analyze a Nuxt.js application to detect CSRF vulnerabilities
   * @param {string} url - URL of the Nuxt.js application
   * @returns {Promise<Object>} - Analysis results
   */
  async function analyzeNuxtApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if it's a Nuxt.js app
      const isNuxt = await page.evaluate(() => {
        return !!window.__NUXT__ || 
               !!document.querySelector('[data-n-head="ssr"]') ||
               !!document.getElementById('__NUXT_DATA__');
      });
      
      if (!isNuxt) {
        return {
          isNuxt: false,
          message: 'Not a Nuxt.js application'
        };
      }
      
      // Extract Nuxt version if available
      const nuxtVersion = await page.evaluate(() => {
        if (window.__NUXT__ && window.__NUXT__.serverRendered) {
          return "Nuxt.js SSR detected";
        }
        return "Nuxt.js detected (version unknown)";
      });
      
      // Check for CSRF protection
      const csrfProtection = await page.evaluate(() => {
        // Check Nuxt state for CSRF token
        let stateToken = null;
        if (window.__NUXT__ && window.__NUXT__.state) {
          stateToken = window.__NUXT__.state.csrf || 
                      window.__NUXT__.state.token || 
                      null;
        }
        
        // Check for CSRF meta tag
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfMetaToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
        
        // Check cookies for CSRF tokens
        const csrfCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => 
            cookie.toLowerCase().includes('csrf') || 
            cookie.toLowerCase().includes('xsrf')
          );
        
        return {
          stateToken,
          csrfMetaToken,
          csrfCookies
        };
      });
      
      return {
        isNuxt: true,
        url,
        nuxtVersion,
        csrfProtection
      };
    } finally {
      await browser.close();
    }
  }
  
  // Export the Nuxt.js adapter functions
  module.exports = {
    adaptRequest,
    generateTestComponent,
    analyzeNuxtApp
  };