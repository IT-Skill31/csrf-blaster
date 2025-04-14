/**
 * Form Template Generator
 * Generates HTML form templates for CSRF payloads
 */

const utils = require('../core/utils');

/**
 * Generate an HTML form for a GET request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML form template
 */
function getGetFormTemplate(params) {
  const {
    url,
    data = {},
    formId = `csrf-form-${Date.now()}`,
    formAttributes = '',
    hiddenForm = true
  } = params;
  
  // Build query string from data
  const queryString = utils.serializeObject(data);
  const targetUrl = queryString ? `${url}?${queryString}` : url;
  
  return `
<form id="${formId}" action="${utils.escapeHtml(targetUrl)}" method="GET" ${formAttributes} ${hiddenForm ? 'class="hidden"' : ''}>
  <!-- GET form does not need input fields as data is in the URL -->
  <button type="submit">Submit</button>
</form>`;
}

/**
 * Generate an HTML form for a POST request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML form template
 */
function getPostFormTemplate(params) {
  const {
    url,
    data = {},
    formId = `csrf-form-${Date.now()}`,
    formAttributes = '',
    hiddenForm = true,
    csrfToken = null
  } = params;
  
  // Build input fields from data
  const inputFields = buildInputFields(data);
  
  // Add CSRF token field if provided
  let csrfField = '';
  if (csrfToken && csrfToken.fieldName) {
    csrfField = `
  <input type="hidden" name="${utils.escapeHtml(csrfToken.fieldName)}" value="${utils.escapeHtml(csrfToken.value || '')}" />`;
  }
  
  return `
<form id="${formId}" action="${utils.escapeHtml(url)}" method="POST" ${formAttributes} ${hiddenForm ? 'class="hidden"' : ''}>
  ${csrfField}
  ${inputFields}
  <button type="submit">Submit</button>
</form>`;
}

/**
 * Generate an HTML form for a multipart/form-data POST request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML form template
 */
function getMultipartFormTemplate(params) {
  const {
    url,
    data = {},
    formId = `csrf-form-${Date.now()}`,
    formAttributes = '',
    hiddenForm = true,
    csrfToken = null
  } = params;
  
  // Build input fields from data
  const inputFields = buildInputFields(data);
  
  // Add CSRF token field if provided
  let csrfField = '';
  if (csrfToken && csrfToken.fieldName) {
    csrfField = `
  <input type="hidden" name="${utils.escapeHtml(csrfToken.fieldName)}" value="${utils.escapeHtml(csrfToken.value || '')}" />`;
  }
  
  return `
<form id="${formId}" action="${utils.escapeHtml(url)}" method="POST" enctype="multipart/form-data" ${formAttributes} ${hiddenForm ? 'class="hidden"' : ''}>
  ${csrfField}
  ${inputFields}
  <button type="submit">Submit</button>
</form>`;
}

/**
 * Generate an HTML form for a PUT request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML form template
 */
function getPutFormTemplate(params) {
  const {
    url,
    data = {},
    formId = `csrf-form-${Date.now()}`,
    formAttributes = '',
    hiddenForm = true,
    csrfToken = null
  } = params;
  
  // Build input fields from data
  const inputFields = buildInputFields(data);
  
  // Add CSRF token field if provided
  let csrfField = '';
  if (csrfToken && csrfToken.fieldName) {
    csrfField = `
  <input type="hidden" name="${utils.escapeHtml(csrfToken.fieldName)}" value="${utils.escapeHtml(csrfToken.value || '')}" />`;
  }
  
  // Add method override field
  const methodField = `
  <input type="hidden" name="_method" value="PUT" />`;
  
  return `
<form id="${formId}" action="${utils.escapeHtml(url)}" method="POST" ${formAttributes} ${hiddenForm ? 'class="hidden"' : ''}>
  ${methodField}
  ${csrfField}
  ${inputFields}
  <button type="submit">Submit</button>
</form>`;
}

/**
 * Generate an HTML form for a DELETE request
 * @param {Object} params - Request parameters
 * @returns {string} - HTML form template
 */
function getDeleteFormTemplate(params) {
  const {
    url,
    data = {},
    formId = `csrf-form-${Date.now()}`,
    formAttributes = '',
    hiddenForm = true,
    csrfToken = null
  } = params;
  
  // Build input fields from data
  const inputFields = buildInputFields(data);
  
  // Add CSRF token field if provided
  let csrfField = '';
  if (csrfToken && csrfToken.fieldName) {
    csrfField = `
  <input type="hidden" name="${utils.escapeHtml(csrfToken.fieldName)}" value="${utils.escapeHtml(csrfToken.value || '')}" />`;
  }
  
  // Add method override field
  const methodField = `
  <input type="hidden" name="_method" value="DELETE" />`;
  
  return `
<form id="${formId}" action="${utils.escapeHtml(url)}" method="POST" ${formAttributes} ${hiddenForm ? 'class="hidden"' : ''}>
  ${methodField}
  ${csrfField}
  ${inputFields}
  <button type="submit">Submit</button>
</form>`;
}

/**
 * Get the appropriate form template based on the HTTP method
 * @param {Object} params - Request parameters
 * @returns {string} - HTML form template
 */
function getTemplateByMethod(params) {
  const { method = 'POST' } = params;
  
  switch (method.toUpperCase()) {
    case 'GET':
      return getGetFormTemplate(params);
    case 'POST':
      if (params.contentType === 'multipart/form-data') {
        return getMultipartFormTemplate(params);
      }
      return getPostFormTemplate(params);
    case 'PUT':
      return getPutFormTemplate(params);
    case 'DELETE':
      return getDeleteFormTemplate(params);
    default:
      return getPostFormTemplate(params);
  }
}

/**
 * Build HTML input fields from an object
 * @param {Object} data - Data object
 * @param {string} [prefix=''] - Prefix for nested fields
 * @returns {string} - HTML input fields
 */
function buildInputFields(data, prefix = '') {
  if (!data || typeof data !== 'object') {
    return '';
  }
  
  let fields = '';
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      const fieldName = prefix ? `${prefix}[${key}]` : key;
      
      if (value === null || value === undefined) {
        continue;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested objects
        fields += buildInputFields(value, fieldName);
      } else if (Array.isArray(value)) {
        // Handle arrays
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            fields += buildInputFields(item, `${fieldName}[${index}]`);
          } else {
            fields += `
  <input type="hidden" name="${utils.escapeHtml(fieldName)}[]" value="${utils.escapeHtml(String(item))}" />`;
          }
        });
      } else {
        // Handle scalar values
        fields += `
  <input type="hidden" name="${utils.escapeHtml(fieldName)}" value="${utils.escapeHtml(String(value))}" />`;
      }
    }
  }
  
  return fields;
}

// Export functions
module.exports = {
  getTemplateByMethod,
  getGetFormTemplate,
  getPostFormTemplate,
  getMultipartFormTemplate,
  getPutFormTemplate,
  getDeleteFormTemplate,
  buildInputFields
};