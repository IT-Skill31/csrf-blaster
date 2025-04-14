# CSRF-Blaster API Reference

This document provides detailed information about the CSRF-Blaster API, including all classes, methods, and parameters.

## Table of Contents

- [CSRFBlaster](#csrfblaster)
- [CSRFGenerator](#csrfgenerator)
- [PayloadBuilder](#payloadbuilder)
- [RequestSender](#requestsender)
- [Utilities](#utilities)
- [Framework Adapters](#framework-adapters)
  - [React Adapter](#react-adapter)
  - [Next.js Adapter](#nextjs-adapter)
  - [Vue.js Adapter](#vuejs-adapter)
  - [Nuxt.js Adapter](#nuxtjs-adapter)
  - [Express.js Adapter](#expressjs-adapter)
- [Templates](#templates)

## CSRFBlaster

The main class that provides access to all CSRF-Blaster functionality.

### Constructor

```javascript
const csrfBlaster = new CSRFBlaster(options);
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 5000 | Timeout for requests in milliseconds |
| `headless` | boolean | true | Whether to use headless mode for browser automation |
| `verbose` | boolean | false | Enable verbose logging |

### Methods

#### generatePayload(params)

Generates a CSRF payload based on the provided parameters.

```javascript
const payload = csrfBlaster.generatePayload(params);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Target URL for the CSRF request |
| `method` | string | No | HTTP method (GET, POST, PUT, DELETE) |
| `data` | object | No | Data to include in the request |
| `framework` | string | No | Target framework (react, next, vue, nuxt, express) |
| `requestType` | string | No | Request type (form, xhr, fetch) |
| `contentType` | string | No | Content type for the request |
| `csrfToken` | object | No | CSRF token information |
| `autoSubmit` | boolean | No | Whether to automatically submit the form |
| `delay` | number | No | Delay before submitting the form (in milliseconds) |
| `title` | string | No | Title for the HTML document |

#### test(params)

Tests a CSRF vulnerability on the specified target.

```javascript
const result = await csrfBlaster.test(params);
```

##### Parameters

Same as `generatePayload()`.

##### Return Value

```javascript
{
  success: boolean,       // Whether the request was sent successfully
  targetUrl: string,      // The URL that was tested
  method: string,         // The HTTP method used
  status: number,         // The HTTP status code of the response
  timestamp: string,      // ISO timestamp of the test
  response: string|object // The response data (if available)
}
```

#### createStandalone(params, outputPath)

Creates a standalone HTML file that can be used to test CSRF vulnerabilities.

```javascript
const filePath = csrfBlaster.createStandalone(params, outputPath);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Same as `generatePayload()` |
| `outputPath` | string | Yes | Path to save the HTML file |

##### Return Value

The absolute path to the generated file.

## CSRFGenerator

Responsible for generating CSRF payloads.

### Constructor

```javascript
const generator = new CSRFBlaster.CSRFGenerator(options);
```

#### Options

Same as `CSRFBlaster` constructor.

### Methods

#### generate(params)

Generates a CSRF payload based on the provided parameters.

```javascript
const payload = generator.generate(params);
```

##### Parameters

Same as `csrfBlaster.generatePayload()`.

#### generateMultiple(targetsArray)

Generates multiple CSRF payloads for different targets.

```javascript
const payloads = generator.generateMultiple(targetsArray);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targetsArray` | array | Yes | Array of target parameters objects |

##### Return Value

An array of HTML payloads.

#### generateChain(requestChain)

Generates a CSRF payload that chains multiple requests.

```javascript
const chainPayload = generator.generateChain(requestChain);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requestChain` | array | Yes | Array of request parameters in sequence |

##### Return Value

A single HTML payload that executes the requests in sequence.

#### analyzeWebsite(url)

Analyzes a website for potential CSRF vulnerabilities by examining its forms.

```javascript
const targets = await generator.analyzeWebsite(url);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | The URL to analyze |

##### Return Value

```javascript
[
  {
    action: string,       // Form action URL
    method: string,       // Form method (GET, POST)
    fields: [             // Array of form fields
      {
        name: string,     // Field name
        type: string,     // Field type
        value: string     // Field value
      }
    ],
    csrfToken: {          // CSRF token information (if found)
      fieldName: string,  // Name of the CSRF token field
      value: string      // Value of the CSRF token
    }
  }
]
```

## PayloadBuilder

Builds the complete HTML payload for CSRF attacks.

### Constructor

```javascript
const payloadBuilder = new CSRFBlaster.PayloadBuilder(options);
```

#### Options

Same as `CSRFBlaster` constructor.

### Methods

#### build(params)

Builds a complete HTML document containing the CSRF payload.

```javascript
const html = payloadBuilder.build(params);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template` | string | Yes | HTML template for the CSRF payload |
| `title` | string | No | Title for the HTML document |
| `autoSubmit` | boolean | No | Whether to automatically submit the form |
| `delay` | number | No | Delay before submitting the form (in milliseconds) |
| `chainMode` | boolean | No | Whether the payload is part of a chain |
| `formId` | string | No | ID for the form element |

##### Return Value

Complete HTML document as a string.

#### buildChain(payloads, requestChain)

Builds a chained CSRF attack with multiple requests.

```javascript
const html = payloadBuilder.buildChain(payloads, requestChain);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payloads` | array | Yes | Array of individual payload templates |
| `requestChain` | array | Yes | Array of request parameter objects |

##### Return Value

Complete HTML document with chained requests as a string.

## RequestSender

Sends CSRF requests and validates the results.

### Constructor

```javascript
const requestSender = new CSRFBlaster.RequestSender(options);
```

#### Options

Same as `CSRFBlaster` constructor.

### Methods

#### sendRequest(payload, params)

Sends a CSRF request using the generated payload.

```javascript
const result = await requestSender.sendRequest(payload, params);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payload` | string | Yes | HTML payload to send |
| `params` | object | Yes | Request parameters |

##### Return Value

```javascript
{
  success: boolean,       // Whether the request was sent successfully
  targetUrl: string,      // The URL that was tested
  method: string,         // The HTTP method used
  status: number,         // The HTTP status code of the response
  timestamp: string,      // ISO timestamp of the test
  response: string|object // The response data (if available)
}
```

#### sendMultipleRequests(payloads, params)

Sends multiple CSRF requests in parallel.

```javascript
const results = await requestSender.sendMultipleRequests(payloads, params);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payloads` | array | Yes | Array of HTML payloads |
| `params` | array | Yes | Array of request parameters |

##### Return Value

Array of result objects.

#### sendChainRequest(chainPayload, requestChain)

Sends CSRF requests in a chain (one after another).

```javascript
const result = await requestSender.sendChainRequest(chainPayload, requestChain);
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainPayload` | string | Yes | HTML payload with chained requests |
| `requestChain` | array | Yes | Array of request parameters |

##### Return Value

```javascript
{
  success: boolean,           // Whether all requests in the chain succeeded
  totalRequests: number,      // Total number of requests in the chain
  successfulRequests: number, // Number of successful requests
  requests: array,            // Information about the requests sent
  responses: array,           // Information about the responses received
  timestamp: string           // ISO timestamp of the test
}
```

## Utilities

Various utility functions used throughout the package.

### escapeHtml(text)

Escapes HTML special characters.

```javascript
const escaped = CSRFBlaster.utils.escapeHtml('<script>alert("XSS")</script>');
// &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

### serializeObject(obj, prefix)

Serializes an object to a URL-encoded string.

```javascript
const serialized = CSRFBlaster.utils.serializeObject({ name: 'Test', data: { id: 123 } });
// name=Test&data[id]=123
```

### generateRandomToken(length)

Generates a random token.

```javascript
const token = CSRFBlaster.utils.generateRandomToken(16);
// e.g., 7a81f5efd8b96c25
```

### writeToFile(content, filePath)

Writes content to a file.

```javascript
const path = CSRFBlaster.utils.writeToFile('<html>...</html>', './csrf-test.html');
```

### readFile(filePath)

Reads file content.

```javascript
const content = CSRFBlaster.utils.readFile('./csrf-test.html');
```

### isValidUrl(url)

Checks if a URL is valid.

```javascript
const isValid = CSRFBlaster.utils.isValidUrl('https://example.com');
// true
```

### formatDate(date)

Formats a date string.

```javascript
const formatted = CSRFBlaster.utils.formatDate(new Date());
// e.g., 2023-05-15 14:30:45
```

### createLogger(verbose)

Creates a logger with timestamps.

```javascript
const logger = CSRFBlaster.utils.createLogger(true);
logger.log('Message');
// [2023-05-15 14:30:45] Message
```

### generateUniqueId()

Generates a unique ID.

```javascript
const id = CSRFBlaster.utils.generateUniqueId();
// e.g., 1621098645123-abc123def
```

### safeJsonParse(jsonString, defaultValue)

Safely parses JSON with error handling.

```javascript
const obj = CSRFBlaster.utils.safeJsonParse('{"name":"Test"}', {});
// { name: 'Test' }
```

### extractDomain(url)

Extracts domain from URL.

```javascript
const domain = CSRFBlaster.utils.extractDomain('https://example.com/path');
// example.com
```

### isBrowserEnvironment()

Detects if code is running in a browser environment.

```javascript
const isBrowser = CSRFBlaster.utils.isBrowserEnvironment();
// true in browser, false in Node.js
```

## Framework Adapters

### React Adapter

Provides specific functionality for testing CSRF in React applications.

#### adaptRequest(params)

Adapts request parameters for React applications.

```javascript
const adaptedParams = CSRFBlaster.adapters.react.adaptRequest(params);
```

#### generateTestComponent(params)

Generates a React-specific CSRF test component.

```javascript
const componentCode = CSRFBlaster.adapters.react.generateTestComponent(params);
```

#### analyzeReactApp(url)

Analyzes a React application to detect CSRF vulnerabilities.

```javascript
const analysis = await CSRFBlaster.adapters.react.analyzeReactApp(url);
```

### Next.js Adapter

Provides specific functionality for testing CSRF in Next.js applications.

#### adaptRequest(params)

Adapts request parameters for Next.js applications.

```javascript
const adaptedParams = CSRFBlaster.adapters.next.adaptRequest(params);
```

#### generateTestComponent(params)

Generates a Next.js-specific CSRF test component.

```javascript
const componentCode = CSRFBlaster.adapters.next.generateTestComponent(params);
```

#### analyzeNextApp(url)

Analyzes a Next.js application to detect CSRF vulnerabilities.

```javascript
const analysis = await CSRFBlaster.adapters.next.analyzeNextApp(url);
```

### Vue.js Adapter

Provides specific functionality for testing CSRF in Vue.js applications.

#### adaptRequest(params)

Adapts request parameters for Vue.js applications.

```javascript
const adaptedParams = CSRFBlaster.adapters.vue.adaptRequest(params);
```

#### generateTestComponent(params)

Generates a Vue.js-specific CSRF test component.

```javascript
const componentCode = CSRFBlaster.adapters.vue.generateTestComponent(params);
```

#### analyzeVueApp(url)

Analyzes a Vue.js application to detect CSRF vulnerabilities.

```javascript
const analysis = await CSRFBlaster.adapters.vue.analyzeVueApp(url);
```

### Nuxt.js Adapter

Provides specific functionality for testing CSRF in Nuxt.js applications.

#### adaptRequest(params)

Adapts request parameters for Nuxt.js applications.

```javascript
const adaptedParams = CSRFBlaster.adapters.nuxt.adaptRequest(params);
```

#### generateTestComponent(params)

Generates a Nuxt.js-specific CSRF test component.

```javascript
const componentCode = CSRFBlaster.adapters.nuxt.generateTestComponent(params);
```

#### analyzeNuxtApp(url)

Analyzes a Nuxt.js application to detect CSRF vulnerabilities.

```javascript
const analysis = await CSRFBlaster.adapters.nuxt.analyzeNuxtApp(url);
```

### Express.js Adapter

Provides specific functionality for testing CSRF in Express.js applications.

#### adaptRequest(params)

Adapts request parameters for Express.js applications.

```javascript
const adaptedParams = CSRFBlaster.adapters.express.adaptRequest(params);
```

#### generateTestScript(params)

Generates an Express.js-specific CSRF test script.

```javascript
const scriptCode = CSRFBlaster.adapters.express.generateTestScript(params);
```

#### analyzeExpressApp(url)

Analyzes an Express.js application to detect CSRF vulnerabilities.

```javascript
const analysis = await CSRFBlaster.adapters.express.analyzeExpressApp(url);
```

## Templates

### Form Template

Functions for generating HTML form templates.

#### getTemplateByMethod(params)

Gets the appropriate form template based on the HTTP method.

```javascript
const template = require('./templates/form-template').getTemplateByMethod(params);
```

#### getGetFormTemplate(params)

Generates an HTML form for a GET request.

```javascript
const template = require('./templates/form-template').getGetFormTemplate(params);
```

#### getPostFormTemplate(params)

Generates an HTML form for a POST request.

```javascript
const template = require('./templates/form-template').getPostFormTemplate(params);
```

#### getMultipartFormTemplate(params)

Generates an HTML form for a multipart/form-data POST request.

```javascript
const template = require('./templates/form-template').getMultipartFormTemplate(params);
```

#### getPutFormTemplate(params)

Generates an HTML form for a PUT request.

```javascript
const template = require('./templates/form-template').getPutFormTemplate(params);
```

#### getDeleteFormTemplate(params)

Generates an HTML form for a DELETE request.

```javascript
const template = require('./templates/form-template').getDeleteFormTemplate(params);
```

### XHR Template

Functions for generating XMLHttpRequest templates.

#### getXHRTemplate(params)

Generates an XHR-based CSRF payload template.

```javascript
const template = require('./templates/xhr-template').getXHRTemplate(params);
```

#### getXhrGetTemplate(params)

Generates an XHR template for a GET request.

```javascript
const template = require('./templates/xhr-template').getXhrGetTemplate(params);
```

#### getXhrPostTemplate(params)

Generates an XHR template for a POST request.

```javascript
const template = require('./templates/xhr-template').getXhrPostTemplate(params);
```

#### getXhrPutTemplate(params)

Generates an XHR template for a PUT request.

```javascript
const template = require('./templates/xhr-template').getXhrPutTemplate(params);
```

#### getXhrDeleteTemplate(params)

Generates an XHR template for a DELETE request.

```javascript
const template = require('./templates/xhr-template').getXhrDeleteTemplate(params);
```

### Fetch Template

Functions for generating fetch API templates.

#### getFetchTemplate(params)

Generates a fetch-based CSRF payload template.

```javascript
const template = require('./templates/fetch-template').getFetchTemplate(params);
```

#### getFetchGetTemplate(params)

Generates a fetch template for a GET request.

```javascript
const template = require('./templates/fetch-template').getFetchGetTemplate(params);
```

#### getFetchPostTemplate(params)

Generates a fetch template for a POST request.

```javascript
const template = require('./templates/fetch-template').getFetchPostTemplate(params);
```

#### getFetchPutTemplate(params)

Generates a fetch template for a PUT request.

```javascript
const template = require('./templates/fetch-template').getFetchPutTemplate(params);
```

#### getFetchDeleteTemplate(params)

Generates a fetch template for a DELETE request.

```javascript
const template = require('./templates/fetch-template').getFetchDeleteTemplate(params);
```