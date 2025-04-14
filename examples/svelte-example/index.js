/**
 * Svelte Example for CSRF-Blaster
 * This example demonstrates how to use CSRF-Blaster to test CSRF vulnerabilities in Svelte applications
 */

const CSRFBlaster = require('../../src/index');
const fs = require('fs');
const path = require('path');

// Initialize CSRF-Blaster
const csrfBlaster = new CSRFBlaster({
  verbose: true
});

// Example Svelte app URL (replace with your own test target)
const targetUrl = 'http://localhost:5000';
const apiEndpoint = `${targetUrl}/api/user/update`;

// Example data for the CSRF payload
const csrfData = {
  name: 'CSRF Test',
  email: 'csrf-test@example.com',
  role: 'user'
};

// Output directory for test files
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Generate a basic CSRF payload for a Svelte application
 */
function generateBasicPayload() {
  console.log('Generating basic CSRF payload for Svelte app...');
  
  const payload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'svelte', // Specify the framework
    title: 'Svelte CSRF Test'
  });
  
  // Save the payload to a file
  const filePath = path.join(outputDir, 'svelte-csrf-basic.html');
  fs.writeFileSync(filePath, payload);
  
  console.log(`Basic payload saved to: ${filePath}`);
  return filePath;
}

/**
 * Generate different types of CSRF payloads for Svelte
 */
function generateAllPayloadTypes() {
  console.log('Generating all CSRF payload types for Svelte app...');
  
  // 1. Form-based payload
  const formPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'svelte',
    requestType: 'form',
    title: 'Svelte CSRF Form Test'
  });
  
  // Save form payload
  const formPath = path.join(outputDir, 'svelte-csrf-form.html');
  fs.writeFileSync(formPath, formPayload);
  console.log(`Form payload saved to: ${formPath}`);
  
  // 2. XHR-based payload
  const xhrPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'svelte',
    requestType: 'xhr',
    title: 'Svelte CSRF XHR Test'
  });
  
  // Save XHR payload
  const xhrPath = path.join(outputDir, 'svelte-csrf-xhr.html');
  fs.writeFileSync(xhrPath, xhrPayload);
  console.log(`XHR payload saved to: ${xhrPath}`);
  
  // 3. Fetch-based payload
  const fetchPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'svelte',
    requestType: 'fetch',
    title: 'Svelte CSRF Fetch Test'
  });
  
  // Save Fetch payload
  const fetchPath = path.join(outputDir, 'svelte-csrf-fetch.html');
  fs.writeFileSync(fetchPath, fetchPayload);
  console.log(`Fetch payload saved to: ${fetchPath}`);
  
  return {
    formPath,
    xhrPath,
    fetchPath
  };
}

/**
 * Generate a Svelte CSRF test component
 */
function generateSvelteComponents() {
  console.log('Generating Svelte CSRF test components...');
  
  const { svelte } = csrfBlaster.adapters;
  
  // Regular Svelte component
  const componentCode = svelte.generateTestComponent({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData
  });
  
  // Save the component
  const componentPath = path.join(outputDir, 'CSRFTest.svelte');
  fs.writeFileSync(componentPath, componentCode);
  
  console.log(`Svelte component saved to: ${componentPath}`);
  
  // SvelteKit route
  const routeCode = svelte.generateSvelteKitRoute({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData
  });
  
  // Save the SvelteKit route
  const routePath = path.join(outputDir, 'csrf-test-route.svelte');
  fs.writeFileSync(routePath, routeCode);
  
  console.log(`SvelteKit route saved to: ${routePath}`);
  
  return {
    componentPath,
    routePath
  };
}

/**
 * Test CSRF vulnerability in a Svelte application
 */
async function testSvelteCSRF() {
  console.log('Testing CSRF vulnerability in Svelte app...');
  
  try {
    const result = await csrfBlaster.test({
      url: apiEndpoint,
      method: 'POST',
      data: csrfData,
      framework: 'svelte'
    });
    
    console.log('Test result:');
    console.log(`- Success: ${result.success}`);
    console.log(`- Status: ${result.status}`);
    console.log(`- Timestamp: ${result.timestamp}`);
    
    if (result.success && result.status >= 200 && result.status < 400) {
      console.log('⚠️ POTENTIAL VULNERABILITY: Request succeeded without proper CSRF protection');
    } else {
      console.log('✅ Application seems to be protected against CSRF');
    }
    
    return result;
  } catch (error) {
    console.error('Error testing CSRF vulnerability:', error);
    throw error;
  }
}

/**
 * Analyze a Svelte application for CSRF vulnerabilities
 */
async function analyzeSvelteApp() {
  console.log(`Analyzing Svelte app at ${targetUrl} for CSRF vulnerabilities...`);
  
  try {
    const { svelte } = csrfBlaster.adapters;
    const analysis = await svelte.analyzeSvelteApp(targetUrl);
    
    console.log('Analysis results:');
    
    if (!analysis.isSvelte) {
      console.log(analysis.message);
      return analysis;
    }
    
    console.log(`- Svelte version: ${analysis.svelteVersion || 'Unknown'}`);
    console.log(`- Is SvelteKit: ${analysis.isSvelteKit ? 'Yes' : 'No'}`);
    
    // Check for SvelteKit CSRF token
    if (analysis.csrfProtection.svelteKitCsrf) {
      console.log(`- SvelteKit CSRF token found: ${analysis.csrfProtection.svelteKitCsrf}`);
    } else {
      console.log('- No SvelteKit CSRF token found');
    }
    
    // Check for CSRF cookies
    if (analysis.csrfProtection.csrfCookies && analysis.csrfProtection.csrfCookies.length > 0) {
      console.log('- CSRF tokens found in cookies:');
      analysis.csrfProtection.csrfCookies.forEach(cookie => {
        console.log(`  - ${cookie}`);
      });
    } else {
      console.log('- No CSRF tokens found in cookies');
    }
    
    // Check for CSRF meta tag
    if (analysis.csrfProtection.csrfMetaValue) {
      console.log(`- CSRF token found in meta tag: ${analysis.csrfProtection.csrfMetaValue}`);
    } else {
      console.log('- No CSRF token found in meta tags');
    }
    
    // Save analysis to file
    const analysisPath = path.join(outputDir, 'svelte-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`Analysis saved to: ${analysisPath}`);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing Svelte app:', error);
    throw error;
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    // Generate basic payload
    const basicPayloadPath = generateBasicPayload();
    console.log('\n---\n');
    
    // Generate all payload types
    const payloadPaths = generateAllPayloadTypes();
    console.log('\n---\n');
    
    // Generate Svelte components
    const svelteFiles = generateSvelteComponents();
    console.log('\n---\n');
    
    // Analyze Svelte app (uncomment to run)
    // const analysis = await analyzeSvelteApp();
    // console.log('\n---\n');
    
    // Test CSRF vulnerability (uncomment to run)
    // const testResult = await testSvelteCSRF();
    
    console.log('\nAll examples completed successfully!');
    console.log('Generated files:');
    console.log(`- Basic payload: ${basicPayloadPath}`);
    console.log(`- Form payload: ${payloadPaths.formPath}`);
    console.log(`- XHR payload: ${payloadPaths.xhrPath}`);
    console.log(`- Fetch payload: ${payloadPaths.fetchPath}`);
    console.log(`- Svelte component: ${svelteFiles.componentPath}`);
    console.log(`- SvelteKit route: ${svelteFiles.routePath}`);
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run all examples when this script is executed directly
if (require.main === module) {
  runAllExamples();
}

// Export functions for individual use
module.exports = {
  generateBasicPayload,
  generateAllPayloadTypes,
  generateSvelteComponents,
  testSvelteCSRF,
  analyzeSvelteApp,
  runAllExamples
};