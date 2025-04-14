/**
 * Request Sender
 * Sends CSRF test requests and validates the results
 */

const puppeteer = require('puppeteer');
const utils = require('./utils');

class RequestSender {
  constructor(options = {}) {
    this.options = {
      timeout: 10000,
      headless: true,
      ...options
    };
  }

  /**
   * Send a CSRF request using the generated payload
   * @param {string} payload - HTML payload
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - Test results
   */
  async sendRequest(payload, params) {
    const browser = await puppeteer.launch({ 
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Setup request interception if needed
      if (this.options.verbose) {
        await page.setRequestInterception(true);
        
        page.on('request', request => {
          if (request.url() === params.url) {
            console.log('Intercepted request:', {
              url: request.url(),
              method: request.method(),
              headers: request.headers(),
              postData: request.postData()
            });
          }
          request.continue();
        });
        
        page.on('response', response => {
          if (response.url() === params.url) {
            console.log('Received response:', {
              url: response.url(),
              status: response.status(),
              headers: response.headers()
            });
          }
        });
      }
      
      // Create a temporary HTML file in memory
      await page.setContent(payload, { waitUntil: 'networkidle0' });
      
      // Wait for the request to complete
      let requestSuccess = false;
      let responseStatus = null;
      let responseData = null;
      
      const requestPromise = new Promise((resolve, reject) => {
        page.on('request', request => {
          if (request.url() === params.url && request.method() === params.method) {
            requestSuccess = true;
          }
        });
        
        page.on('response', async response => {
          if (response.url() === params.url) {
            responseStatus = response.status();
            try {
              const contentType = response.headers()['content-type'] || '';
              if (contentType.includes('application/json')) {
                responseData = await response.json();
              } else {
                responseData = await response.text();
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        });
        
        // Set a timeout for the request
        setTimeout(() => {
          if (!responseStatus) {
            reject(new Error('Request timed out'));
          }
        }, this.options.timeout);
      });
      
      // Wait for the request to complete or timeout
      try {
        await requestPromise;
      } catch (error) {
        console.error('Error during request:', error);
      }
      
      // Gather the results
      const results = {
        success: requestSuccess,
        targetUrl: params.url,
        method: params.method,
        status: responseStatus,
        timestamp: new Date().toISOString(),
        response: responseData
      };
      
      if (this.options.verbose) {
        console.log('CSRF test results:', results);
      }
      
      return results;
    } finally {
      await browser.close();
    }
  }

  /**
   * Send multiple CSRF requests in parallel
   * @param {Array<string>} payloads - HTML payloads
   * @param {Array<Object>} params - Request parameters for each payload
   * @returns {Promise<Array<Object>>} - Array of test results
   */
  async sendMultipleRequests(payloads, params) {
    if (!Array.isArray(payloads) || !Array.isArray(params)) {
      throw new Error('Both payloads and params must be arrays');
    }
    
    if (payloads.length !== params.length) {
      throw new Error('Payloads and params arrays must have the same length');
    }
    
    // Send all requests in parallel
    const results = await Promise.all(
      payloads.map((payload, index) => this.sendRequest(payload, params[index]))
    );
    
    return results;
  }

  /**
   * Send CSRF requests in a chain (one after another)
   * @param {string} chainPayload - HTML payload with chained requests
   * @param {Array<Object>} requestChain - Request parameters for the chain
   * @returns {Promise<Object>} - Chain test results
   */
  async sendChainRequest(chainPayload, requestChain) {
    const browser = await puppeteer.launch({ 
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Track requests and responses
      const requests = [];
      const responses = [];
      
      // Setup request tracking
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        // Check if this request is part of our chain
        const isChainRequest = requestChain.some(req => 
          req.url === request.url() && req.method === request.method()
        );
        
        if (isChainRequest) {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            timestamp: new Date().toISOString()
          });
        }
        
        request.continue();
      });
      
      page.on('response', async response => {
        // Check if this response is part of our chain
        const isChainResponse = requestChain.some(req => req.url === response.url());
        
        if (isChainResponse) {
          let responseData;
          try {
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('application/json')) {
              responseData = await response.json();
            } else {
              responseData = await response.text();
            }
          } catch (error) {
            responseData = `Error parsing response: ${error.message}`;
          }
          
          responses.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            data: responseData,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Load the chain payload
      await page.setContent(chainPayload, { waitUntil: 'networkidle0' });
      
      // Wait for all requests to complete or timeout
      await new Promise(resolve => {
        const totalTime = requestChain.reduce((sum, req) => sum + (req.chainDelay || 1000), 0);
        setTimeout(resolve, totalTime + this.options.timeout);
      });
      
      // Calculate success based on the number of successful requests
      const successCount = responses.filter(res => res.status >= 200 && res.status < 400).length;
      
      // Gather the results
      const results = {
        success: successCount === requestChain.length,
        totalRequests: requestChain.length,
        successfulRequests: successCount,
        requests,
        responses,
        timestamp: new Date().toISOString()
      };
      
      if (this.options.verbose) {
        console.log('CSRF chain test results:', results);
      }
      
      return results;
    } finally {
      await browser.close();
    }
  }
}

module.exports = RequestSender;