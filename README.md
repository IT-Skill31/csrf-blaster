# CSRF-Blaster

A Node.js package for testing CSRF (Cross-Site Request Forgery) vulnerabilities across various JavaScript frameworks.

> ⚠️ **WARNING**: This tool is intended for ethical security testing purposes only. Always ensure you have proper authorization before testing any system.

## Overview

CSRF-Blaster is a comprehensive toolkit designed to help security professionals test for CSRF vulnerabilities in web applications built with popular JavaScript frameworks including React, Next.js, Vue.js, Nuxt.js, and Express.js.

## Features

- Generate CSRF payloads for different frameworks
- Automate the testing of CSRF vulnerabilities
- Framework-specific adapters for targeted testing (React, Next.js, Vue.js, Nuxt.js, Express.js, Angular, and Svelte)
- Support for various request types (form, XHR, fetch)
- Chain multiple CSRF requests
- Analyze websites for potential CSRF vulnerabilities
- Create standalone HTML files for manual testing

## Installation

```bash
npm install csrf-blaster
```

## Basic Usage

```javascript
const CSRFBlaster = require('csrf-blaster');

// Initialize with options
const csrfBlaster = new CSRFBlaster({
  timeout: 10000,
  verbose: true
});

// Generate a CSRF payload
const payload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/user/update',
  method: 'POST',
  data: { name: 'New Name', email: 'new@example.com' },
  framework: 'react'
});

// Test a CSRF vulnerability
async function testCSRF() {
  const result = await csrfBlaster.test({
    url: 'https://example.com/api/user/update',
    method: 'POST',
    data: { name: 'New Name', email: 'new@example.com' },
    framework: 'react'
  });
  
  console.log('Test result:', result);
}

// Create a standalone HTML file for testing
const filePath = csrfBlaster.createStandalone({
  url: 'https://example.com/api/user/update',
  method: 'POST',
  data: { name: 'New Name', email: 'new@example.com' },
  framework: 'react'
}, './csrf-test.html');
```

## Advanced Usage

### Testing with Different Request Types

```javascript
// Using a form-based CSRF payload
const formPayload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/submit',
  method: 'POST',
  data: { comment: 'This is a test' },
  requestType: 'form',
  framework: 'vue'
});

// Using an XHR-based CSRF payload
const xhrPayload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/data',
  method: 'PUT',
  data: { status: 'updated' },
  requestType: 'xhr',
  framework: 'react'
});

// Using a fetch-based CSRF payload
const fetchPayload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/user',
  method: 'DELETE',
  requestType: 'fetch',
  framework: 'next'
});
```

### Testing with CSRF Tokens

```javascript
// Manually specifying a CSRF token
const payload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/protected',
  method: 'POST',
  data: { value: 'test' },
  csrfToken: {
    fieldName: 'csrf_token',
    value: 'a1b2c3d4e5f6'
  },
  framework: 'express'
});

// Using automatic CSRF token extraction
const payload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/protected',
  method: 'POST',
  data: { value: 'test' },
  framework: 'react' // The framework adapter will attempt to extract the token
});
```

### Chaining Multiple Requests

```javascript
// Create a chain of CSRF requests
const chainPayload = csrfBlaster.generateChain([
  {
    url: 'https://example.com/api/login',
    method: 'POST',
    data: { username: 'user', password: 'pass' },
    chainDelay: 2000 // Wait 2 seconds before the next request
  },
  {
    url: 'https://example.com/api/profile',
    method: 'PUT',
    data: { name: 'New Name' },
    chainDelay: 1000
  },
  {
    url: 'https://example.com/api/settings',
    method: 'POST',
    data: { notifications: false }
  }
]);
```

### Analyzing a Website for CSRF Vulnerabilities

```javascript
async function analyzeWebsite() {
  const generator = new CSRFBlaster.CSRFGenerator();
  const targets = await generator.analyzeWebsite('https://example.com');
  
  console.log('Potential CSRF targets:', targets);
  
  // Generate payloads for all potential targets
  const payloads = targets.map(target => 
    csrfBlaster.generatePayload({
      url: target.action,
      method: target.method,
      data: target.fields.reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
      }, {}),
      csrfToken: target.csrfToken
    })
  );
  
  return payloads;
}
```

## Framework Adapters

CSRF-Blaster includes adapters for popular JavaScript frameworks:

### React

```javascript
const { adapters } = require('csrf-blaster');

// Analyze a React application
const results = await adapters.react.analyzeReactApp('https://react-app.example.com');

// Generate a React-specific test component
const componentCode = adapters.react.generateTestComponent({
  url: 'https://react-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Next.js

```javascript
const { adapters } = require('csrf-blaster');

// Analyze a Next.js application
const results = await adapters.next.analyzeNextApp('https://nextjs-app.example.com');

// Generate a Next.js-specific test component
const componentCode = adapters.next.generateTestComponent({
  url: 'https://nextjs-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Vue.js

```javascript
const { adapters } = require('csrf-blaster');

// Analyze a Vue.js application
const results = await adapters.vue.analyzeVueApp('https://vue-app.example.com');

// Generate a Vue.js-specific test component
const componentCode = adapters.vue.generateTestComponent({
  url: 'https://vue-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Nuxt.js

```javascript
const { adapters } = require('csrf-blaster');

// Analyze a Nuxt.js application
const results = await adapters.nuxt.analyzeNuxtApp('https://nuxt-app.example.com');

// Generate a Nuxt.js-specific test component
const componentCode = adapters.nuxt.generateTestComponent({
  url: 'https://nuxt-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Express.js

```javascript
const { adapters } = require('csrf-blaster');

// Analyze an Express.js application
const results = await adapters.express.analyzeExpressApp('https://express-app.example.com');

// Generate an Express.js-specific test script
const scriptCode = adapters.express.generateTestScript({
  url: 'https://express-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Angular

```javascript
const { adapters } = require('csrf-blaster');

// Analyze an Angular application
const results = await adapters.angular.analyzeAngularApp('https://angular-app.example.com');

// Generate an Angular-specific test component
const componentCode = adapters.angular.generateTestComponent({
  url: 'https://angular-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});

// Generate an Angular service for testing
const serviceCode = adapters.angular.generateTestService({
  url: 'https://angular-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Svelte

```javascript
const { adapters } = require('csrf-blaster');

// Analyze a Svelte application
const results = await adapters.svelte.analyzeSvelteApp('https://svelte-app.example.com');

// Generate a Svelte-specific test component
const componentCode = adapters.svelte.generateTestComponent({
  url: 'https://svelte-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});

// Generate a SvelteKit route for testing
const routeCode = adapters.svelte.generateSvelteKitRoute({
  url: 'https://svelte-app.example.com/api/user',
  method: 'POST',
  data: { name: 'Test' }
});
```

## API Reference

### CSRFBlaster

The main class for generating and testing CSRF payloads.

```javascript
const csrfBlaster = new CSRFBlaster(options);
```

#### Options

- `timeout` (number): Timeout for requests in milliseconds. Default: 5000
- `headless` (boolean): Whether to use headless mode for browser automation. Default: true
- `verbose` (boolean): Enable verbose logging. Default: false

#### Methods

- `generatePayload(params)`: Generates a CSRF payload
- `test(params)`: Tests a CSRF vulnerability
- `createStandalone(params, outputPath)`: Creates a standalone HTML file for testing
- `generateChain(requestChain)`: Generates a payload with chained requests

### CSRFGenerator

Responsible for generating CSRF payloads.

```javascript
const generator = new CSRFBlaster.CSRFGenerator(options);
```

#### Methods

- `generate(params)`: Generates a single CSRF payload
- `generateMultiple(targetsArray)`: Generates multiple CSRF payloads
- `generateChain(requestChain)`: Generates a chained CSRF payload
- `analyzeWebsite(url)`: Analyzes a website for potential CSRF targets

### RequestSender

Sends CSRF requests and analyzes the results.

```javascript
const sender = new CSRFBlaster.RequestSender(options);
```

#### Methods

- `sendRequest(payload, params)`: Sends a CSRF request using the payload
- `sendMultipleRequests(payloads, params)`: Sends multiple CSRF requests
- `sendChainRequest(chainPayload, requestChain)`: Sends a chain of CSRF requests

## Ethical Considerations

This tool is designed for security professionals to perform authorized security testing. Always follow these guidelines:

1. **Only test systems you own or have explicit permission to test**
2. **Follow responsible disclosure practices**
3. **Do not use this tool for malicious purposes**
4. **Respect privacy and data protection regulations**
5. **Document all testing activities**

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

If you discover a security vulnerability within this package, please send an email to [your-email]. All security vulnerabilities will be promptly addressed.