/**
 * CSRF-Blaster
 * A Node.js package for testing CSRF vulnerabilities across various JavaScript frameworks
 * 
 * WARNING: This tool is intended for ethical security testing only.
 * Always ensure you have proper authorization before testing any system.
 */

const CSRFGenerator = require('./core/csrf-generator');
const PayloadBuilder = require('./core/payload-builder');
const RequestSender = require('./core/request-sender');
const utils = require('./core/utils');

// Framework adapters
const reactAdapter = require('./adapters/react');
const nextAdapter = require('./adapters/nextjs');
const vueAdapter = require('./adapters/vue');
const nuxtAdapter = require('./adapters/nuxt');
const expressAdapter = require('./adapters/express');
const angularAdapter = require('./adapters/angular');
const svelteAdapter = require('./adapters/svelte');

class CSRFBlaster {
  constructor(options = {}) {
    this.options = {
      timeout: 5000,
      headless: true,
      verbose: false,
      ...options
    };
    
    this.generator = new CSRFGenerator(this.options);
    this.payloadBuilder = new PayloadBuilder(this.options);
    this.requestSender = new RequestSender(this.options);
  }
  
  /**
   * Generate a CSRF payload for the specified target
   * @param {Object} params - Configuration parameters
   * @param {string} params.url - Target URL
   * @param {string} params.method - HTTP method (GET, POST, PUT, DELETE)
   * @param {Object} params.data - Data to include in the request
   * @param {string} params.framework - Target framework (react, next, vue, nuxt, express, angular, svelte)
   * @returns {string} - HTML payload that can execute the CSRF attack
   */
  generatePayload(params) {
    if (!params.url) {
      throw new Error('Target URL is required');
    }
    
    if (!params.method) {
      params.method = 'POST';
    }
    
    // Select the appropriate adapter based on the framework
    let adapter;
    switch (params.framework) {
      case 'react':
        adapter = reactAdapter;
        break;
      case 'next':
        adapter = nextAdapter;
        break;
      case 'vue':
        adapter = vueAdapter;
        break;
      case 'nuxt':
        adapter = nuxtAdapter;
        break;
      case 'express':
        adapter = expressAdapter;
        break;
      case 'angular':
        adapter = angularAdapter;
        break;
      case 'svelte':
        adapter = svelteAdapter;
        break;
      default:
        adapter = null;
    }
    
    return this.generator.generate({
      ...params,
      adapter
    });
  }
  
  /**
   * Test a CSRF vulnerability on the specified target
   * @param {Object} params - Test configuration parameters
   * @returns {Promise<Object>} - Test results
   */
  async test(params) {
    const payload = this.generatePayload(params);
    return this.requestSender.sendRequest(payload, params);
  }
  
  /**
   * Create a standalone HTML file that can be used to test CSRF vulnerabilities
   * @param {Object} params - Configuration parameters
   * @param {string} outputPath - Path to save the HTML file
   * @returns {string} - Path to the generated HTML file
   */
  createStandalone(params, outputPath) {
    const payload = this.generatePayload(params);
    return utils.writeToFile(payload, outputPath);
  }
}

// Export the main class
module.exports = CSRFBlaster;

// Export individual components for advanced usage
module.exports.CSRFGenerator = CSRFGenerator;
module.exports.PayloadBuilder = PayloadBuilder;
module.exports.RequestSender = RequestSender;
module.exports.utils = utils;

// Export framework adapters
module.exports.adapters = {
  react: reactAdapter,
  next: nextAdapter,
  vue: vueAdapter,
  nuxt: nuxtAdapter,
  express: expressAdapter,
  angular: angularAdapter,
  svelte: svelteAdapter
};