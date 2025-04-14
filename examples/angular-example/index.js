/**
 * Angular Example for CSRF-Blaster
 * This example demonstrates how to use CSRF-Blaster to test CSRF vulnerabilities in Angular applications
 */

const CSRFBlaster = require('../../src/index');
const fs = require('fs');
const path = require('path');

// Initialize CSRF-Blaster
const csrfBlaster = new CSRFBlaster({
  verbose: true
});

// Example Angular app URL (replace with your own test target)
const targetUrl = 'http://localhost:4200';
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
 * Generate a basic CSRF payload for an Angular application
 */
function generateBasicPayload() {
  console.log('Generating basic CSRF payload for Angular app...');
  
  const payload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'angular', // Specify the framework
    title: 'Angular CSRF Test'
  });
  
  // Save the payload to a file
  const filePath = path.join(outputDir, 'angular-csrf-basic.html');
  fs.writeFileSync(filePath, payload);
  
  console.log(`Basic payload saved to: ${filePath}`);
  return filePath;
}

/**
 * Generate different types of CSRF payloads for Angular
 */
function generateAllPayloadTypes() {
  console.log('Generating all CSRF payload types for Angular app...');
  
  // 1. Form-based payload
  const formPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'angular',
    requestType: 'form',
    title: 'Angular CSRF Form Test'
  });
  
  // Save form payload
  const formPath = path.join(outputDir, 'angular-csrf-form.html');
  fs.writeFileSync(formPath, formPayload);
  console.log(`Form payload saved to: ${formPath}`);
  
  // 2. XHR-based payload
  const xhrPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'angular',
    requestType: 'xhr',
    title: 'Angular CSRF XHR Test'
  });
  
  // Save XHR payload
  const xhrPath = path.join(outputDir, 'angular-csrf-xhr.html');
  fs.writeFileSync(xhrPath, xhrPayload);
  console.log(`XHR payload saved to: ${xhrPath}`);
  
  // 3. Fetch-based payload
  const fetchPayload = csrfBlaster.generatePayload({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData,
    framework: 'angular',
    requestType: 'fetch',
    title: 'Angular CSRF Fetch Test'
  });
  
  // Save Fetch payload
  const fetchPath = path.join(outputDir, 'angular-csrf-fetch.html');
  fs.writeFileSync(fetchPath, fetchPayload);
  console.log(`Fetch payload saved to: ${fetchPath}`);
  
  return {
    formPath,
    xhrPath,
    fetchPath
  };
}

/**
 * Generate an Angular CSRF test component
 */
function generateAngularComponent() {
  console.log('Generating Angular CSRF test component...');
  
  const { angular } = csrfBlaster.adapters;
  
  const componentCode = angular.generateTestComponent({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData
  });
  
  // Save the component
  const componentPath = path.join(outputDir, 'csrf-test.component.ts');
  fs.writeFileSync(componentPath, componentCode);
  
  console.log(`Angular component saved to: ${componentPath}`);
  
  // Also generate a service
  const serviceCode = angular.generateTestService({
    url: apiEndpoint,
    method: 'POST',
    data: csrfData
  });
  
  // Save the service
  const servicePath = path.join(outputDir, 'csrf-test.service.ts');
  fs.writeFileSync(servicePath, serviceCode);
  
  console.log(`Angular service saved to: ${servicePath}`);
  
  return {
    componentPath,
    servicePath
  };
}

/**
 * Test CSRF vulnerability in an Angular application
 */
async function testAngularCSRF() {
  console.log('Testing CSRF vulnerability in Angular app...');
  
  try {
    const result = await csrfBlaster.test({
      url: apiEndpoint,
      method: 'POST',
      data: csrfData,
      framework: 'angular'
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
 * Analyze an Angular application for CSRF vulnerabilities
 */
async function analyzeAngularApp() {
  console.log(`Analyzing Angular app at ${targetUrl} for CSRF vulnerabilities...`);
  
  try {
    const { angular } = csrfBlaster.adapters;
    const analysis = await angular.analyzeAngularApp(targetUrl);
    
    console.log('Analysis results:');
    
    if (!analysis.isAngular) {
      console.log(analysis.message);
      return analysis;
    }
    
    console.log(`- Angular version: ${analysis.angularVersion || 'Unknown'}`);
    
    // Check for CSRF protection in cookies
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
    
    // Check for HttpClientXsrfModule
    if (analysis.csrfProtection.hasXsrfModule) {
      console.log('- Detected possible use of HttpClientXsrfModule');
    }
    
    // Check for CSRF requests
    if (analysis.csrfRequests && analysis.csrfRequests.length > 0) {
      console.log(`- Detected ${analysis.csrfRequests.length} requests with CSRF headers`);
    } else {
      console.log('- No requests with CSRF headers detected');
    }
    
    // Save analysis to file
    const analysisPath = path.join(outputDir, 'angular-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`Analysis saved to: ${analysisPath}`);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing Angular app:', error);
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
    
    // Generate Angular component and service
    const angularFiles = generateAngularComponent();
    console.log('\n---\n');
    
    // Analyze Angular app (uncomment to run)
    // const analysis = await analyzeAngularApp();
    // console.log('\n---\n');
    
    // Test CSRF vulnerability (uncomment to run)
    // const testResult = await testAngularCSRF();
    
    console.log('\nAll examples completed successfully!');
    console.log('Generated files:');
    console.log(`- Basic payload: ${basicPayloadPath}`);
    console.log(`- Form payload: ${payloadPaths.formPath}`);
    console.log(`- XHR payload: ${payloadPaths.xhrPath}`);
    console.log(`- Fetch payload: ${payloadPaths.fetchPath}`);
    console.log(`- Angular component: ${angularFiles.componentPath}`);
    console.log(`- Angular service: ${angularFiles.servicePath}`);
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
  generateAngularComponent,
  testAngularCSRF,
  analyzeAngularApp,
  runAllExamples
};