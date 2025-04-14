/**
 * CSRF Generator
 * Core module for generating CSRF payloads
 */

const PayloadBuilder = require('./payload-builder');
const { getTemplateByMethod } = require('../templates/form-template');
const { getXHRTemplate } = require('../templates/xhr-template');
const { getFetchTemplate } = require('../templates/fetch-template');

class CSRFGenerator {
  constructor(options = {}) {
    this.options = options;
    this.payloadBuilder = new PayloadBuilder(options);
  }

  /**
   * Generate a CSRF payload based on the provided parameters
   * @param {Object} params - CSRF parameters
   * @returns {string} - HTML payload
   */
  generate(params) {
    const {
      url,
      method = 'POST',
      data = {},
      headers = {},
      csrfToken = null,
      requestType = 'form', // 'form', 'xhr', or 'fetch'
      autoSubmit = true,
      adapter = null
    } = params;

    // Apply framework-specific adaptations if available
    const adaptedParams = adapter ? adapter.adaptRequest(params) : params;
    
    // Select the appropriate template based on request type
    let template;
    switch (adaptedParams.requestType || requestType) {
      case 'xhr':
        template = getXHRTemplate(adaptedParams);
        break;
      case 'fetch':
        template = getFetchTemplate(adaptedParams);
        break;
      case 'form':
      default:
        template = getTemplateByMethod(adaptedParams);
        break;
    }

    // Build the complete HTML payload
    return this.payloadBuilder.build({
      ...adaptedParams,
      template,
      autoSubmit
    });
  }

  /**
   * Generate multiple CSRF payloads for different targets
   * @param {Array<Object>} targetsArray - Array of target parameters
   * @returns {Array<string>} - Array of HTML payloads
   */
  generateMultiple(targetsArray) {
    if (!Array.isArray(targetsArray)) {
      throw new Error('targetsArray must be an array of target parameters');
    }

    return targetsArray.map(target => this.generate(target));
  }

  /**
   * Generate a CSRF payload that chains multiple requests
   * @param {Array<Object>} requestChain - Array of request parameters in sequence
   * @returns {string} - HTML payload with chained requests
   */
  generateChain(requestChain) {
    if (!Array.isArray(requestChain) || requestChain.length === 0) {
      throw new Error('requestChain must be a non-empty array of request parameters');
    }

    // Generate individual payloads for each request in the chain
    const payloads = requestChain.map(req => {
      // Set autoSubmit to false for all except the first request
      return this.generate({
        ...req,
        chainMode: true
      });
    });

    // Build a combined HTML that executes the requests in sequence
    return this.payloadBuilder.buildChain(payloads, requestChain);
  }

  /**
   * Analyze a website for potential CSRF vulnerabilities by examining its forms
   * @param {string} url - The URL to analyze
   * @returns {Promise<Array<Object>>} - Potential CSRF targets
   */
  async analyzeWebsite(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: this.options.headless });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: this.options.timeout });
      
      // Analyze the forms on the page
      const forms = await page.evaluate(() => {
        return Array.from(document.forms).map(form => {
          const formData = {
            action: form.action,
            method: form.method.toUpperCase() || 'GET',
            fields: Array.from(form.elements)
              .filter(el => el.name)
              .map(el => ({
                name: el.name,
                type: el.type,
                value: el.value
              }))
          };
          
          // Check for CSRF tokens
          const csrfField = formData.fields.find(field => 
            field.name.toLowerCase().includes('csrf') || 
            field.name.toLowerCase().includes('token')
          );
          
          if (csrfField) {
            formData.csrfToken = {
              fieldName: csrfField.name,
              value: csrfField.value
            };
          }
          
          return formData;
        });
      });
      
      return forms;
    } finally {
      await browser.close();
    }
  }
}

module.exports = CSRFGenerator;