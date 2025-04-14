/**
 * Angular Adapter
 * Provides specific functionality for testing CSRF in Angular applications
 */

/**
 * Generate an Angular-specific CSRF test component
 * @param {Object} params - Test parameters
 * @returns {string} - Angular component code
 */
function generateTestComponent(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `
  import { Component, OnInit } from '@angular/core';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  
  @Component({
    selector: 'app-csrf-test',
    template: \`
      <div style="display: none">
        Angular CSRF Test Component
      </div>
    \`
  })
  export class CSRFTestComponent implements OnInit {
    constructor(private http: HttpClient) {}
  
    ngOnInit() {
      this.performCSRFTest();
    }
  
    async performCSRFTest() {
      try {
        // Try to extract CSRF token from Angular app
        let csrfToken = null;
        
        // Check for XSRF-TOKEN cookie (commonly used in Angular)
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith('XSRF-TOKEN=')) {
            csrfToken = decodeURIComponent(cookie.split('=')[1]);
            break;
          }
        }
        
        // Check meta tags for CSRF token
        if (!csrfToken) {
          const csrfMeta = document.querySelector('meta[name="csrf-token"]');
          if (csrfMeta) {
            csrfToken = csrfMeta.getAttribute('content');
          }
        }
        
        // Set up headers
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        
        // Add CSRF token to headers if found
        if (csrfToken) {
          headers.set('X-CSRF-TOKEN', csrfToken);
          headers.set('X-XSRF-TOKEN', csrfToken);
        }
        
        // Make the request
        this.http.${method.toLowerCase()}('${url}', 
          ${method.toLowerCase() !== 'get' ? JSON.stringify(data) : '{}'},
          { headers, withCredentials: true }
        ).subscribe(
          (response) => {
            console.log('Angular CSRF Test Response:', response);
          },
          (error) => {
            console.error('Angular CSRF Test Error:', error);
          }
        );
      } catch (error) {
        console.error('Error in CSRF test:', error);
      }
    }
  }
  
  // Module definition for easy import
  import { NgModule } from '@angular/core';
  import { HttpClientModule } from '@angular/common/http';
  
  @NgModule({
    declarations: [CSRFTestComponent],
    imports: [HttpClientModule],
    exports: [CSRFTestComponent]
  })
  export class CSRFTestModule {}
  `;
  }
  
  /**
   * Generate an Angular service for CSRF testing
   * @param {Object} params - Test parameters
   * @returns {string} - Angular service code
   */
  function generateTestService(params) {
    const {
      url,
      method = 'POST',
      data = {}
    } = params;
    
    return `
  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { Observable } from 'rxjs';
  
  @Injectable({
    providedIn: 'root'
  })
  export class CSRFTestService {
    constructor(private http: HttpClient) {}
  
    /**
     * Perform a CSRF test request
     * @returns {Observable<any>} - The response observable
     */
    performCSRFTest(): Observable<any> {
      // Try to extract CSRF token
      let csrfToken = this.extractCSRFToken();
      
      // Set up headers
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      
      // Add CSRF token to headers if found
      if (csrfToken) {
        headers = headers.set('X-CSRF-TOKEN', csrfToken);
        headers = headers.set('X-XSRF-TOKEN', csrfToken);
      }
      
      // Make the request
      return this.http.${method.toLowerCase()}('${url}', 
        ${method.toLowerCase() !== 'get' ? JSON.stringify(data) : '{}'},
        { headers, withCredentials: true }
      );
    }
    
    /**
     * Extract CSRF token from various sources
     * @returns {string|null} - CSRF token or null if not found
     */
    private extractCSRFToken(): string | null {
      let csrfToken = null;
      
      // Check for XSRF-TOKEN cookie (commonly used in Angular)
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('XSRF-TOKEN=')) {
          csrfToken = decodeURIComponent(cookie.split('=')[1]);
          break;
        }
      }
      
      // Check meta tags for CSRF token
      if (!csrfToken) {
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
          csrfToken = csrfMeta.getAttribute('content');
        }
      }
      
      return csrfToken;
    }
  }
  `;
  }
  
  /**
   * Adapt request parameters for Angular applications
   * @param {Object} params - Original request parameters
   * @returns {Object} - Adapted parameters for Angular
   */
  function adaptRequest(params) {
    const adaptedParams = { ...params };
    
    // Angular applications typically use JSON for API requests
    if (!adaptedParams.contentType) {
      adaptedParams.contentType = 'application/json';
    }
    
    // Angular uses HttpClient, but we'll use fetch for CSRF tests
    if (!adaptedParams.requestType) {
      adaptedParams.requestType = 'fetch';
    }
    
    // Check for common Angular CSRF token patterns
    if (!adaptedParams.csrfToken) {
      adaptedParams.csrfToken = {
        extractionCode: `
          // Try to extract CSRF token from Angular app
          let csrfToken = null;
          
          // Check for XSRF-TOKEN cookie (commonly used in Angular)
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('XSRF-TOKEN=')) {
              csrfToken = decodeURIComponent(cookie.split('=')[1]);
              break;
            }
          }
          
          // Check meta tags for CSRF token
          if (!csrfToken) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            if (csrfMeta) {
              csrfToken = csrfMeta.getAttribute('content');
            }
          }
          
          return csrfToken;
        `
      };
    }
    
    // Add CSRF token to request headers if available
    if (adaptedParams.csrfToken && !adaptedParams.headers) {
      adaptedParams.headers = {
        'X-CSRF-TOKEN': '${csrfToken}',
        'X-XSRF-TOKEN': '${csrfToken}' // Angular commonly uses this header name
      };
    }
    
    return adaptedParams;
  }
  
  /**
   * Analyze an Angular application to detect CSRF vulnerabilities
   * @param {string} url - URL of the Angular application
   * @returns {Promise<Object>} - Analysis results
   */
  async function analyzeAngularApp(url) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if it's an Angular app
      const isAngular = await page.evaluate(() => {
        return !!window.ng || 
               !!document.querySelector('[ng-version]') ||
               !!document.querySelector('[_nghost]') ||
               !!document.querySelector('[_ngcontent]');
      });
      
      if (!isAngular) {
        return {
          isAngular: false,
          message: 'Not an Angular application'
        };
      }
      
      // Extract Angular version if available
      const angularVersion = await page.evaluate(() => {
        const ngVersionEl = document.querySelector('[ng-version]');
        return ngVersionEl ? ngVersionEl.getAttribute('ng-version') : 'Unknown';
      });
      
      // Check for CSRF protection
      const csrfProtection = await page.evaluate(() => {
        // Check cookies for XSRF-TOKEN (common in Angular)
        const csrfCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => 
            cookie.toLowerCase().includes('csrf') || 
            cookie.toLowerCase().includes('xsrf')
          );
        
        // Check for CSRF meta tags
        const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
        const csrfMetaValue = csrfMetaTag ? csrfMetaTag.getAttribute('content') : null;
        
        // Check for HttpClientXsrfModule in the source code
        const pageSource = document.documentElement.outerHTML;
        const hasXsrfModule = 
          pageSource.includes('HttpClientXsrfModule') || 
          pageSource.includes('withCredentials: true');
        
        return {
          csrfCookies,
          csrfMetaValue,
          hasXsrfModule
        };
      });
      
      // Analyze network requests to check for CSRF headers
      const requests = [];
      page.on('request', request => {
        const headers = request.headers();
        if (headers['x-xsrf-token'] || headers['x-csrf-token']) {
          requests.push({
            url: request.url(),
            headers: {
              'x-xsrf-token': headers['x-xsrf-token'],
              'x-csrf-token': headers['x-csrf-token']
            }
          });
        }
      });
      
      // Trigger some navigation to capture requests
      await page.click('a').catch(() => {}); // Ignore errors if no links
      await page.waitForTimeout(2000);
      
      return {
        isAngular: true,
        url,
        angularVersion,
        csrfProtection,
        csrfRequests: requests
      };
    } finally {
      await browser.close();
    }
  }
  
  // Export the Angular adapter functions
  module.exports = {
    adaptRequest,
    generateTestComponent,
    generateTestService,
    analyzeAngularApp
  };