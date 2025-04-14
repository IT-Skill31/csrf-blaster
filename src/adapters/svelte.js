/**
 * Svelte Adapter
 * Provides specific functionality for testing CSRF in Svelte applications
 */

/**
 * Generate a Svelte-specific CSRF test component
 * @param {Object} params - Test parameters
 * @returns {string} - Svelte component code
 */
function generateTestComponent(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `<script>
    import { onMount } from 'svelte';
  
    onMount(() => {
      performCSRFTest();
    });
  
    async function performCSRFTest() {
      try {
        // Try to extract CSRF token from Svelte app
        let csrfToken = null;
        
        // Check page context if available (SvelteKit)
        if (window.__SVELTEKIT_DATA) {
          csrfToken = window.__SVELTEKIT_DATA.csrf || null;
        }
        
        // Check for CSRF token in meta tags
        if (!csrfToken) {
          const csrfMeta = document.querySelector('meta[name="csrf-token"]');
          if (csrfMeta) {
            csrfToken = csrfMeta.getAttribute('content');
          }
        }
        
        // Check for CSRF token in cookies
        if (!csrfToken) {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('csrf=') || 
                cookie.startsWith('xsrf=') ||
                cookie.startsWith('_csrf=')) {
              csrfToken = cookie.split('=')[1];
              break;
            }
          }
        }
        
        // Set up headers
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add CSRF token to headers if found
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        
        // Make the request
        const response = await fetch('${url}', {
          method: '${method}',
          headers,
          credentials: 'include',
          body: ${method !== 'GET' ? `JSON.stringify(${JSON.stringify(data)})` : 'undefined'}
        });
        
        console.log('Svelte CSRF Test Response Status:', response.status);
        
        // Try to parse response
        let responseData;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        console.log('Svelte CSRF Test Response:', responseData);
      } catch (error) {
        console.error('Svelte CSRF Test Error:', error);
      }
    }
  </script>
  
  <div style="display: none">
    Svelte CSRF Test Component
  </div>`;
  }
  
  /**
   * Generate a SvelteKit route for CSRF testing
   * @param {Object} params - Test parameters
   * @returns {string} - SvelteKit route code
   */
  function generateSvelteKitRoute(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `// src/routes/csrf-test/+page.svelte
  <script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
  
    let result = '';
    let error = '';
    let status = '';
  
    onMount(() => {
      if (browser) {
        performCSRFTest();
      }
    });
  
    async function performCSRFTest() {
      try {
        // Try to extract CSRF token from SvelteKit
        let csrfToken = null;
        
        // Check if we have CSRF token in the page store
        if ($page.data && $page.data.csrf) {
          csrfToken = $page.data.csrf;
        }
        
        // Set up headers
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add CSRF token to headers if found
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        
        // Make the request
        status = 'Loading...';
        const response = await fetch('${url}', {
          method: '${method}',
          headers,
          credentials: 'include',
          body: ${method !== 'GET' ? `JSON.stringify(${JSON.stringify(data)})` : 'undefined'}
        });
        
        status = \`Status: \${response.status}\`;
        
        // Try to parse response
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          result = JSON.stringify(await response.json(), null, 2);
        } else {
          result = await response.text();
        }
        
        console.log('SvelteKit CSRF Test Response:', result);
      } catch (err) {
        error = err.message;
        console.error('SvelteKit CSRF Test Error:', err);
      }
    }
  </script>
  
  <h1>CSRF Test</h1>
  
  {#if status}
    <div class="status">{status}</div>
  {/if}
  
  {#if error}
    <div class="error">
      <h2>Error</h2>
      <pre>{error}</pre>
    </div>
  {/if}
  
  {#if result}
    <div class="result">
      <h2>Result</h2>
      <pre>{result}</pre>
    </div>
  {/if}
  
  <style>
    .error {
      color: red;
      margin-top: 20px;
    }
    
    .result, .status {
      margin-top: 20px;
    }
    
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
    }
  </style>`;
  }
  
  /**
   * Adapt request parameters for Svelte applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for Svelte
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // Svelte applications typically use JSON for API requests
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // Svelte typically uses fetch, so default to fetch for CSRF tests
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'fetch';
    }
    
    // Check for common Svelte CSRF token patterns
    if (!adaptedParams.csrfToken) {
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from Svelte app
          let csrfToken = null;
          
          // Check SvelteKit context if available
          if (window.__SVELTEKIT_DATA) {
            csrfToken = window.__SVELTEKIT_DATA.csrf || null;
          }
          
          // Check for CSRF token in meta tags
          if (!csrfToken) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            if (csrfMeta) {
              csrfToken = csrfMeta.getAttribute('content');
            }
          }
          
          // Check for CSRF token in cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('csrf=') || 
                  cookie.startsWith('xsrf=') ||
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
        'X-CSRF-Token': '${csrfToken}'
      };
    }
    
    return adaptedParams;
  }
  
  /**
   * Analyze a Svelte application to detect CSRF vulnerabilities
   * @param {string} url - URL of the Svelte application
   * @returns {Promise<Object>} - Analysis results
   */
  async function analyzeSvelteApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if it's a Svelte app
      const isSvelte = await page.evaluate(() => {
        // Look for Svelte-specific attributes
        return !!document.querySelector('[class*="svelte-"]') || 
               !!document.querySelector('[__svelte]') ||
               !!window.__SVELTEKIT_DATA;
      });
      
      if (!isSvelte) {
        return {
          isSvelte: false,
          message: 'Not a Svelte application'
        };
      }
      
      // Check if it's SvelteKit
      const isSvelteKit = await page.evaluate(() => {
        return !!window.__SVELTEKIT_DATA;
      });
      
      // Check for CSRF protection
      const csrfProtection = await page.evaluate(() => {
        // Check for SvelteKit CSRF token
        let svelteKitCsrf = null;
        if (window.__SVELTEKIT_DATA) {
          svelteKitCsrf = window.__SVELTEKIT_DATA.csrf || null;
        }
        
        // Check cookies for CSRF tokens
        const csrfCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => 
            cookie.toLowerCase().includes('csrf') || 
            cookie.toLowerCase().includes('xsrf')
          );
        
        // Check for CSRF meta tags
        const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
        const csrfMetaValue = csrfMetaTag ? csrfMetaTag.getAttribute('content') : null;
        
        return {
          svelteKitCsrf,
          csrfCookies,
          csrfMetaValue
        };
      });
      
      // Try to determine Svelte version from page source
      const svelteVersion = await page.evaluate(() => {
        // This is an imperfect way to detect Svelte version
        if (window.__SVELTEKIT_DATA) {
          return 'SvelteKit detected (version unknown)';
        }
        
        const svelteMeta = document.querySelector('meta[name="svelte-version"]');
        if (svelteMeta) {
          return svelteMeta.getAttribute('content');
        }
        
        return 'Svelte detected (version unknown)';
      });
      
      return {
        isSvelte: true,
        isSvelteKit,
        url,
        svelteVersion,
        csrfProtection
      };
    } finally {
      await browser.close();
    }
  }
  
  // Export the Svelte adapter functions
  module.exports = {
    adaptRequest,
    generateTestComponent,
    generateSvelteKitRoute,
    analyzeSvelteApp
  };