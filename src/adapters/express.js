/**
 * Express Adapter
 * Provides specific functionality for testing CSRF in Express.js applications
 */

/**
 * Generate an Express.js-specific CSRF test script
 * @param {Object} params - Test parameters
 * @returns {string} - Express test script
 */
function generateTestScript(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `
  // CSRF Test Script for Express.js applications
  const axios = require('axios');
  const cookieParser = require('cookie-parser');
  const express = require('express');
  const app = express();
  
  // Set up a simple Express app to perform the CSRF test
  app.use(express.json());
  app.use(cookieParser());
  
  app.get('/', async (req, res) => {
    try {
      // First, make a GET request to the target to get any cookies/CSRF tokens
      const setupResponse = await axios.get('${url}', {
        withCredentials: true // Include cookies
      });
      
      // Extract cookies from the response
      const cookies = setupResponse.headers['set-cookie'] || [];
      
      // Look for CSRF token in cookies or response body
      let csrfToken = null;
      
      // Check cookies for CSRF token
      for (const cookie of cookies) {
        if (cookie.includes('csrf') || cookie.includes('xsrf')) {
          const match = cookie.match(/=(.*?);/);
          if (match && match[1]) {
            csrfToken = match[1];
            break;
          }
        }
      }
      
      // If not found in cookies, check response body if it's HTML
      if (!csrfToken && typeof setupResponse.data === 'string') {
        // Look for CSRF token in meta tags
        const metaMatch = setupResponse.data.match(/<meta\\s+name=["']csrf-token["']\\s+content=["'](.*?)["']/i);
        if (metaMatch && metaMatch[1]) {
          csrfToken = metaMatch[1];
        }
        
        // Look for CSRF token in form inputs
        if (!csrfToken) {
          const inputMatch = setupResponse.data.match(/<input\\s+.*?name=["'](_csrf|csrf_token|csrfToken)["']\\s+.*?value=["'](.*?)["']/i);
          if (inputMatch && inputMatch[2]) {
            csrfToken = inputMatch[2];
          }
        }
      }
      
      // Set up headers for the CSRF request
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add CSRF token to headers if found
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        headers['CSRF-Token'] = csrfToken;
      }
      
      // Add cookies from the setup request
      if (cookies.length > 0) {
        headers['Cookie'] = cookies.join('; ');
      }
      
      // Now make the actual CSRF request
      const csrfResponse = await axios({
        method: '${method}',
        url: '${url}',
        headers,
        data: ${JSON.stringify(data)},
        withCredentials: true
      });
      
      // Return the results
      res.json({
        success: true,
        statusCode: csrfResponse.status,
        responseData: csrfResponse.data,
        csrfToken
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });
    }
  });
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(\`CSRF test server running on port \${PORT}\`);
    console.log('Open http://localhost:' + PORT + ' to run the test');
  });
  `;
  }
  
  /**
   * Adapt request parameters for Express.js applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for Express.js
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // Express applications can use various content types, but JSON is common for APIs
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // Express.js can handle various request types, default to form for simplicity
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'form';
    }
    
    // Check for common Express.js CSRF token patterns (often using csurf middleware)
    if (!adaptedParams.csrfToken) {
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from Express.js app
          let csrfToken = null;
          
          // Check for CSRF token in form inputs (common with csurf)
          const csrfInput = document.querySelector('input[name="_csrf"]') || 
                           document.querySelector('input[name="csrf"]') ||
                           document.querySelector('input[name="csrfToken"]');
          
          if (csrfInput) {
            csrfToken = csrfInput.value;
          }
          
          // If not in form, check meta tags
          if (!csrfToken) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            if (csrfMeta) {
              csrfToken = csrfMeta.getAttribute('content');
            }
          }
          
          // If still not found, check cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('_csrf=') || 
                  cookie.startsWith('XSRF-TOKEN=')) {
                csrfToken = cookie.split('=')[1];
                break;
              }
            }
          }
          
          return csrfToken;
        `
      };
    }
    
    // Add CSRF token to both headers and form data for Express (csurf may check either)
    if (adaptedParams.csrfToken) {
      if (!adaptedParams.headers) {
        adaptedParams.headers = {};
      }
      adaptedParams.headers['X-CSRF-Token'] = '${csrfToken}';
      adaptedParams.headers['CSRF-Token'] = '${csrfToken}';
      
      // Also add to form data if this is a form request
      if (adaptedParams.requestType === 'form' && !adaptedParams.data) {
        adaptedParams.data = {};
      }
      
      if (adaptedParams.requestType === 'form') {
        adaptedParams.data._csrf = '${csrfToken}';
      }
    }
    
    return adaptedParams;
  }
  
  /**
   * Analyze an Express.js application to detect CSRF vulnerabilities
   * @param {string} url - URL of the Express.js application
   * @returns {Promise<Object>} - Analysis results
   */
  async function analyzeExpressApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // It's hard to definitively identify Express.js from the client side,
      // but we can check for common patterns and headers
      
      // Check for Express CSRF protection
      const csrfProtection = await page.evaluate(() => {
        // Check for CSRF token in form inputs (common with csurf)
        const csrfInputs = Array.from(document.querySelectorAll('input[name="_csrf"], input[name="csrf"], input[name="csrfToken"]'))
          .map(input => ({
            name: input.getAttribute('name'),
            value: input.value
          }));
        
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
          csrfInputs,
          csrfMetaToken,
          csrfCookies
        };
      });
      
      // Check response headers for Express fingerprints
      const headers = await page.evaluate(() => {
        // This only works for same-origin requests due to browser security
        // We can't directly access the headers, but we can check for X-Powered-By
        // in meta tags sometimes used by Express security modules
        const powerMeta = document.querySelector('meta[name="x-powered-by"]');
        return {
          xPoweredBy: powerMeta ? powerMeta.getAttribute('content') : null
        };
      });
      
      return {
        url,
        possibleExpress: csrfProtection.csrfInputs.length > 0 || csrfProtection.csrfCookies.length > 0,
        headers,
        csrfProtection
      };
    } finally {
      await browser.close();
    }
  }
  
  // Export the Express.js adapter functions
  module.exports = {
    adaptRequest,
    generateTestScript,
    analyzeExpressApp
  };