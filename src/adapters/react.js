/**
 * React Adapter
 * Provides specific functionality for testing CSRF in React applications
 */

/**
 * Generate a React-specific CSRF test component
 * @param {Object} params - Test parameters
 * @returns {string} - React component code
 */
function generateTestComponent(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `
        import React, { useEffect } from 'react';
        
        // CSRF Test Component for React applications
        function CSRFTestComponent() {
            useEffect(() => {
            // This effect will run when the component mounts
            const csrfTest = async () => {
                try {
                // Extract CSRF token if available
                let csrfToken = localStorage.getItem('csrf_token') || 
                                localStorage.getItem('csrfToken') || 
                                localStorage.getItem('CSRF_TOKEN');
                
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (csrfToken) {
                    headers['X-CSRF-Token'] = csrfToken;
                }
                
                const response = await fetch('${url}', {
                    method: '${method}',
                    headers,
                    credentials: 'include',
                    body: ${method !== 'GET' ? `JSON.stringify(${JSON.stringify(data)})` : 'undefined'}
                });
                
                console.log('CSRF Test Response:', response.status);
                } catch (error) {
                console.error('CSRF Test Error:', error);
                }
            };
            
            csrfTest();
            }, []);
            
            return (
            <div style={{ display: 'none' }}>
                CSRF Test Component
            </div>
            );
        }
        
        export default CSRFTestComponent;
  `;
  }
  
  /**
   * Adapt request parameters for React applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for React
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // React applications often use JSON for API requests
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // React often uses fetch or axios, so default to fetch for CSRF tests
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'fetch';
    }
    
    // Check for common React CSRF token patterns
    if (!adaptedParams.csrfToken) {
      // Look for common React CSRF token patterns in localStorage or cookies
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from localStorage
          let csrfToken = localStorage.getItem('csrf_token') || 
                          localStorage.getItem('csrfToken') || 
                          localStorage.getItem('CSRF_TOKEN') ||
                          localStorage.getItem('X-CSRF-TOKEN');
          
          // If not in localStorage, try to extract from cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('csrf_token=') || 
                  cookie.startsWith('csrfToken=') || 
                  cookie.startsWith('CSRF_TOKEN=') ||
                  cookie.startsWith('X-CSRF-TOKEN=')) {
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
   * Analyze a React application to detect CSRF vulnerabilities
   * @param {string} url - URL of the React application
   * @returns {Promise<Object>} - Analysis results
   */
  async function analyzeReactApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract React version if available
      const reactVersion = await page.evaluate(() => {
        if (window.React && window.React.version) {
          return window.React.version;
        }
        return null;
      });
      
      // Check for CSRF protection mechanisms
      const csrfProtection = await page.evaluate(() => {
        // Check local storage for CSRF tokens
        const localStorageTokens = Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('csrf') || key.toLowerCase().includes('token')
        ).map(key => ({ key, value: localStorage.getItem(key) }));
        
        // Check cookies for CSRF tokens
        const csrfCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => 
            cookie.toLowerCase().includes('csrf') || cookie.toLowerCase().includes('token')
          );
        
        // Check for meta tags with CSRF tokens
        const csrfMetaTags = Array.from(document.querySelectorAll('meta'))
          .filter(meta => 
            (meta.getAttribute('name') || '').toLowerCase().includes('csrf') || 
            (meta.getAttribute('name') || '').toLowerCase().includes('token')
          )
          .map(meta => ({
            name: meta.getAttribute('name'),
            content: meta.getAttribute('content')
          }));
        
        return {
          localStorageTokens,
          csrfCookies,
          csrfMetaTags
        };
      });
      
      // Check network requests for CSRF headers or tokens
      const networkRequests = [];
      page.on('request', request => {
        const headers = request.headers();
        if (headers['x-csrf-token'] || 
            headers['csrf-token'] || 
            headers['x-xsrf-token'] ||
            headers['xsrf-token']) {
          networkRequests.push({
            url: request.url(),
            method: request.method(),
            headers: headers
          });
        }
      });
      
      // Wait a bit to capture some requests
      await page.waitForTimeout(5000);
      
      return {
        url,
        reactVersion,
        csrfProtection,
        networkRequests
      };
    } finally {
      await browser.close();
    }
  }
  
// Export the React adapter functions
module.exports = {
    adaptRequest,
    generateTestComponent,
    analyzeReactApp
}