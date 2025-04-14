/**
 * Next.js Adapter
 * Provides specific functionality for testing CSRF in Next.js applications
 */

/**
 * Generate a Next.js-specific CSRF test component
 * @param {Object} params - Test parameters
 * @returns {string} - Next.js component code
 */
function generateTestComponent(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `
  import { useEffect } from 'react';
  
  // CSRF Test Component for Next.js applications
  export default function CSRFTestComponent() {
    useEffect(() => {
      // This effect will run when the component mounts
      const csrfTest = async () => {
        try {
          // Next.js often uses getServerSideProps to generate CSRF tokens
          // Try to extract tokens from the page
          const nextDataEl = document.getElementById('__NEXT_DATA__');
          let csrfToken = null;
          
          if (nextDataEl) {
            try {
              const nextData = JSON.parse(nextDataEl.textContent);
              // Look for CSRF token in Next.js data
              csrfToken = nextData.props?.pageProps?.csrfToken || null;
            } catch (e) {
              console.error('Error parsing Next.js data:', e);
            }
          }
          
          // If not found in Next.js data, try cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('csrfToken=') || 
                  cookie.startsWith('CSRF-TOKEN=')) {
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
          }
          
          const response = await fetch('${url}', {
            method: '${method}',
            headers,
            credentials: 'include',
            body: ${method !== 'GET' ? `JSON.stringify(${JSON.stringify(data)})` : 'undefined'}
          });
          
          console.log('Next.js CSRF Test Response:', response.status);
        } catch (error) {
          console.error('Next.js CSRF Test Error:', error);
        }
      };
      
      csrfTest();
    }, []);
    
    return (
      <div style={{ display: 'none' }}>
        Next.js CSRF Test Component
      </div>
    );
  }
  `;
  }
  
  /**
   * Adapt request parameters for Next.js applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for Next.js
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // Next.js applications typically use JSON for API requests
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // Next.js typically uses fetch, so default to fetch for CSRF tests
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'fetch';
    }
    
    // Check for common Next.js CSRF token patterns
    if (!adaptedParams.csrfToken) {
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from Next.js data
          let csrfToken = null;
          const nextDataEl = document.getElementById('__NEXT_DATA__');
          
          if (nextDataEl) {
            try {
              const nextData = JSON.parse(nextDataEl.textContent);
              // Try to find CSRF token in Next.js data
              if (nextData.props && nextData.props.pageProps) {
                csrfToken = nextData.props.pageProps.csrfToken || 
                            nextData.props.pageProps.csrf || 
                            null;
              }
            } catch (e) {
              console.error('Error extracting Next.js CSRF token:', e);
            }
          }
          
          // If not in Next.js data, try cookies
          if (!csrfToken) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('csrfToken=') || 
                  cookie.startsWith('CSRF-TOKEN=') ||
                  cookie.startsWith('next-csrf=')) {
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
   * Analyze a Next.js application to detect CSRF vulnerabilities
   * @param {string} url - URL of the Next.js application
   * @returns {Promise<Object>} - Analysis results
   */
async function analyzeNextApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if it's a Next.js app
      const isNextJs = await page.evaluate(() => {
        return !!document.getElementById('__NEXT_DATA__');
      });
      
      if (!isNextJs) {
        return {
          isNextJs: false,
          message: 'Not a Next.js application'
        };
      }
      
      // Extract Next.js data
      const nextJsData = await page.evaluate(() => {
        const nextDataEl = document.getElementById('__NEXT_DATA__');
        if (nextDataEl) {
          try {
            return JSON.parse(nextDataEl.textContent);
          } catch (e) {
            return null;
          }
        }
        return null;
      });
      
      // Check for CSRF protection
      const csrfProtection = await page.evaluate(() => {
        // Check cookies for CSRF tokens
        const csrfCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => 
            cookie.toLowerCase().includes('csrf') || 
            cookie.toLowerCase().includes('xsrf') ||
            cookie.toLowerCase().includes('token')
          );
        
        // Check for CSRF meta tags
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
          csrfCookies,
          csrfMetaTags
        };
      });
      
      return {
        isNextJs: true,
        url,
        buildId: nextJsData?.buildId,
        csrfProtection
      };
    } finally {
      await browser.close();
    }
}
  
// Export the Next.js adapter functions
module.exports = {
    adaptRequest,
    generateTestComponent,
    analyzeNextApp
};