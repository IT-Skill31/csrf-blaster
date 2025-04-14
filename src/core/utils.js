/**
 * Utility functions for CSRF-Blaster
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Serialize an object to a URL-encoded string
 * @param {Object} obj - Object to serialize
 * @param {string} [prefix=''] - Prefix for nested parameters
 * @returns {string} - URL-encoded string
 */
function serializeObject(obj, prefix = '') {
  const pairs = [];
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const keyName = prefix ? `${prefix}[${key}]` : key;
      
      if (value === null || value === undefined) {
        continue;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        pairs.push(serializeObject(value, keyName));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            pairs.push(serializeObject(item, `${keyName}[${index}]`));
          } else {
            pairs.push(`${encodeURIComponent(keyName)}[]=${encodeURIComponent(item)}`);
          }
        });
      } else {
        pairs.push(`${encodeURIComponent(keyName)}=${encodeURIComponent(value)}`);
      }
    }
  }
  
  return pairs.join('&');
}

/**
 * Generate a random token
 * @param {number} [length=32] - Token length
 * @returns {string} - Random token
 */
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Write content to a file
 * @param {string} content - Content to write
 * @param {string} filePath - File path
 * @returns {string} - Absolute file path
 */
function writeToFile(content, filePath) {
  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the content to the file
  fs.writeFileSync(filePath, content, 'utf8');
  
  // Return the absolute path
  return path.resolve(filePath);
}

/**
 * Read file content
 * @param {string} filePath - File path
 * @returns {string} - File content
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check if a URL is valid
 * @param {string} url - URL to check
 * @returns {boolean} - True if valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format a date string
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date = new Date()) {
  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

/**
 * Create a logger with timestamps
 * @param {boolean} [verbose=false] - Enable verbose logging
 * @returns {Object} - Logger object
 */
function createLogger(verbose = false) {
  return {
    log: (...args) => {
      console.log(`[${formatDate()}]`, ...args);
    },
    error: (...args) => {
      console.error(`[${formatDate()}]`, ...args);
    },
    warn: (...args) => {
      console.warn(`[${formatDate()}]`, ...args);
    },
    verbose: (...args) => {
      if (verbose) {
        console.log(`[${formatDate()}] [VERBOSE]`, ...args);
      }
    }
  };
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} [defaultValue=null] - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Extract domain from URL
 * @param {string} url - URL
 * @returns {string} - Domain
 */
function extractDomain(url) {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (error) {
    return '';
  }
}

/**
 * Detect if code is running in a browser environment
 * @returns {boolean} - True if in browser
 */
function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Export utility functions
module.exports = {
  escapeHtml,
  serializeObject,
  generateRandomToken,
  writeToFile,
  readFile,
  isValidUrl,
  formatDate,
  createLogger,
  generateUniqueId,
  safeJsonParse,
  extractDomain,
  isBrowserEnvironment
};