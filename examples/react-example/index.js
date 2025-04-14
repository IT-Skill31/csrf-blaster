/**
 * React Example for CSRF-Blaster
 * This example demonstrates how to use CSRF-Blaster to test CSRF vulnerabilities in React applications
 */

const CSRFBlaster = require('../../src/index');
const fs = require('fs');
const path = require('path');

// Initialize CSRF-Blaster
const csrfBlaster = new CSRFBlaster({
  verbose: true
});

// Example React app URL (replace with your own test target)
const targetUrl = 'http://localhost:3000';
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
 * Generate a basic CSRF payload for a React application
 */
function generateBasicPayload() {
  console.log('Generating basic CSRF payload for React app...');
  
  const payload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'react', // Specify the framework
    title: 'React CSRF Test'
  });
  
  // Save the payload to a file
  const filePath = path.join(outputDir, 'react-csrf-basic.html');
  fs.writeFileSync(filePath, payload);
  
  console.log(`Basic payload saved to: ${filePath}`);
  return filePath;
}

/**
 * Generate different types of CSRF payloads for React
 */
function generateAllPayloadTypes() {
  console.log('Generating all CSRF payload types for React app...');
  
  // 1. Form-based payload
  const formPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'react',
    requestType: 'form',
    title: 'React CSRF Form Test'
  });
  
  // Save form payload
  const formPath = path.join(outputDir, 'react-csrf-form.html');
  fs.writeFileSync(formPath, formPayload);
  console.log(`Form payload saved to: ${formPath}`);
  
  // 2. XHR-based payload
  const xhrPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'react',
    requestType: 'xhr',
    title: 'React CSRF XHR Test'
  });
  
  // Save XHR payload
  const xhrPath = path.join(outputDir, 'react-csrf-xhr.html');
  fs.writeFileSync(xhrPath, xhrPayload);
  console.log(`XHR payload saved to: ${xhrPath}`);
  
  // 3. Fetch-based payload
  const fetchPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'react',
    requestType: 'fetch',
    title: 'React CSRF Fetch Test'
  });
  
  // Save Fetch payload
  const fetchPath = path.join(outputDir, 'react-csrf-fetch.html');
  fs.writeFileSync(fetchPath, fetchPayload);
  console.log(`Fetch payload saved to: ${fetchPath}`);
  
  return {
    formPath,
    xhrPath,
    fetchPath
  };
}

/**
 * Generate a React CSRF test component
 */
function generateReactComponent() {
  console.log('Generating React CSRF test component...');
  
  const { react } = csrfBlaster.adapters;
  
  const componentCode = react.generateTestComponent({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData
  });
  
  // Save the component
  const componentPath = path.join(outputDir, 'CSRFTestComponent.jsx');
  fs.writeFileSync(componentPath, componentCode);
  
  console.log(`React component saved to: ${componentPath}`);
  return componentPath;
}

/**
 * Test CSRF vulnerability in a React application
 */
async function testReactCSRF() {
  console.log('Testing CSRF vulnerability in React app...');
  
  try {
    const result = await csrfBlaster.test({
      url: apiEndpoint,
      method: 'POST',
      data: csrfData,
      framework: 'react'
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
 * Analyze a React application for CSRF vulnerabilities
 */
async function analyzeReactApp() {
  console.log(`Analyzing React app at ${targetUrl} for CSRF vulnerabilities...`);
  
  try {
    const { react } = csrfBlaster.adapters;
    const analysis = await react.analyzeReactApp(targetUrl);
    
    console.log('Analysis results:');
    console.log(`- React version: ${analysis.reactVersion || 'Unknown'}`);
    
    // Check for CSRF tokens in local storage
    if (analysis.csrfProtection.localStorageTokens.length > 0) {
      console.log('- CSRF tokens found in localStorage:');
      analysis.csrfProtection.localStorageTokens.forEach(token => {
        console.log(`  - ${token.key}: ${token.value}`);
      });
    } else {
      console.log('- No CSRF tokens found in localStorage');
    }
    
    // Check for CSRF cookies
    if (analysis.csrfProtection.csrfCookies.length > 0) {
      console.log('- CSRF tokens found in cookies:');
      analysis.csrfProtection.csrfCookies.forEach(cookie => {
        console.log(`  - ${cookie}`);
      });
    } else {
      console.log('- No CSRF tokens found in cookies');
    }
    
    // Check for CSRF meta tags
    if (analysis.csrfProtection.csrfMetaTags.length > 0) {
      console.log('- CSRF tokens found in meta tags:');
      analysis.csrfProtection.csrfMetaTags.forEach(meta => {
        console.log(`  - ${meta.name}: ${meta.content}`);
      });
    } else {
      console.log('- No CSRF tokens found in meta tags');
    }
    
    // Save analysis to file
    const analysisPath = path.join(outputDir, 'react-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`Analysis saved to: ${analysisPath}`);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing React app:', error);
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
    
    // Generate React component
    const componentPath = generateReactComponent();
    console.log('\n---\n');
    
    // Analyze React app (uncomment to run)
    // const analysis = await analyzeReactApp();
    // console.log('\n---\n');
    
    // Test CSRF vulnerability (uncomment to run)
    // const testResult = await testReactCSRF();
    
    console.log('\nAll examples completed successfully!');
    console.log('Generated files:');
    console.log(`- Basic payload: ${basicPayloadPath}`);
    console.log(`- Form payload: ${payloadPaths.formPath}`);
    console.log(`- XHR payload: ${payloadPaths.xhrPath}`);
    console.log(`- Fetch payload: ${payloadPaths.fetchPath}`);
    console.log(`- React component: ${componentPath}`);
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
  generateReactComponent,
  testReactCSRF,
  analyzeReactApp,
  runAllExamples
};