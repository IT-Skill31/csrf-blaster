# CSRF Security Notes

This document provides detailed information about Cross-Site Request Forgery (CSRF) vulnerabilities, how they work, and how to mitigate them in your applications.

## What is CSRF?

Cross-Site Request Forgery (CSRF) is a type of attack that occurs when a malicious website, email, blog, instant message, or program causes a user's web browser to perform an unwanted action on a trusted site when the user is authenticated. The attack works because browser requests automatically include any credentials associated with the site, such as the user's session cookie, IP address, Windows domain credentials, etc.

## How CSRF Attacks Work

1. **User Authentication**: The user logs into a legitimate website (e.g., a banking site) and receives a session cookie.
2. **User Visits Malicious Site**: Without logging out of the legitimate site, the user visits a malicious website.
3. **Malicious Request**: The malicious website contains code that submits a form or makes a request to the legitimate website.
4. **Browser Sends Credentials**: The browser automatically includes the user's session cookie in the request.
5. **Action Performed**: The legitimate website processes the request as if it came from the user.

## Common CSRF Attack Scenarios

### Form Submission

```html
<!-- Malicious HTML hosted on attacker.com -->
<form action="https://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="recipient" value="attacker">
  <input type="hidden" name="amount" value="1000">
</form>
<script>
  document.getElementById("csrf-form").submit();
</script>
```

### Image Requests

```html
<!-- Seemingly innocent image that performs a GET request -->
<img src="https://bank.com/transfer?recipient=attacker&amount=1000" width="0" height="0" border="0">
```

### XMLHttpRequest/Fetch Requests

```html
<script>
  fetch('https://bank.com/api/settings', {
    method: 'POST',
    credentials: 'include', // This is key - it sends cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'attacker@evil.com',
    }),
  });
</script>
```

## CSRF Across Different Frameworks

### React

React applications often use JWT tokens stored in localStorage, which are not automatically sent with requests like cookies. However, if the tokens are stored in cookies or if the application manually adds them to requests, CSRF vulnerabilities can exist.

```javascript
// Vulnerable React code
fetch('/api/update-profile', {
  method: 'POST',
  credentials: 'include', // Sends cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

### Next.js

Next.js applications, especially those using server-side rendering, often rely on cookie-based authentication which can be vulnerable to CSRF.

```javascript
// Vulnerable Next.js API route
export default async function handler(req, res) {
  // No CSRF validation
  if (req.method === 'POST') {
    // Process the request using session from cookies
    const session = req.cookies.session;
    // ...
  }
}
```

### Vue.js and Nuxt.js

Vue.js and Nuxt.js applications have similar vulnerabilities, especially when using cookie-based authentication without proper CSRF protection.

### Express.js

Express.js applications that use cookie-based sessions without CSRF protection are vulnerable.

```javascript
// Vulnerable Express route
app.post('/api/update', (req, res) => {
  // No CSRF validation
  const userId = req.session.userId;
  // Update user data...
});
```

## CSRF Protection Mechanisms

### Anti-CSRF Tokens

The most common protection is to include a unique token in each form or request:

1. **Server generates a token** and stores it in the user's session
2. **Token is included in forms** as a hidden field or in custom HTTP headers
3. **Server validates the token** when processing the request

```html
<form action="/api/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random_token_here">
  <!-- Other form fields -->
</form>
```

```javascript
// Server-side validation
if (req.body.csrf_token !== req.session.csrf_token) {
  return res.status(403).send('CSRF validation failed');
}
```

### SameSite Cookies

Modern browsers support the `SameSite` attribute for cookies, which can prevent CSRF attacks:

```
Set-Cookie: session=123; SameSite=Strict
```

SameSite options:
- `Strict`: Cookie is only sent for same-site requests
- `Lax`: Cookie is sent for same-site requests and top-level navigations with safe HTTP methods
- `None`: Cookie is sent for all requests (requires Secure attribute)

### Custom Headers

CSRF attacks via `<form>` cannot set custom headers, so requiring a custom header can prevent attacks:

```javascript
// Client-side
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// Server-side
if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
  return res.status(403).send('CSRF validation failed');
}
```

### Double Cookie Submit

The server sets a cookie with a random token and requires the same token to be submitted as a request parameter:

```javascript
// Set cookie
res.cookie('csrf_token', 'random_token', { httpOnly: false });

// Client includes the token in requests
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.cookie.match(/csrf_token=(.*?)(;|$)/)[1],
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// Server validates
if (req.headers['x-csrf-token'] !== req.cookies.csrf_token) {
  return res.status(403).send('CSRF validation failed');
}
```

## Framework-Specific CSRF Protection

### React

```javascript
// Using axios with CSRF token
import axios from 'axios';

// Get CSRF token from meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Configure axios to include the token
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

### Next.js

Next.js can use various approaches:

```javascript
// Using next-csrf package
import { csrf } from 'next-csrf';

export default csrf({
  // CSRF protection options
})(function YourApiRoute(req, res) {
  // Your API logic
});
```

### Vue.js

```javascript
// Using axios in Vue
import axios from 'axios';

// Get CSRF token from meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Configure axios
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

### Express.js

```javascript
// Using csurf middleware
const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();

// Setup middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(csrf({ cookie: true }));

// Add CSRF token to all rendered templates
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Protected route
app.post('/api/update', (req, res) => {
  // CSRF is automatically validated by the middleware
  // If the token is invalid, it will throw an error
  
  // Process the request...
  res.send('Update successful');
});

// Error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('CSRF validation failed');
  }
  next(err);
});
```

## Testing for CSRF Vulnerabilities

Testing for CSRF vulnerabilities involves:

1. **Identifying endpoints** that perform state-changing operations
2. **Creating a test page** that triggers requests to these endpoints
3. **Verifying if requests succeed** without proper CSRF tokens or validation

### Manual Testing Process

1. Authenticate to the target application in browser A
2. Identify a sensitive function (e.g., change email, transfer funds)
3. Create an HTML file with a form that submits to the target endpoint
4. Open the HTML file in browser B (where you're not authenticated)
5. If the action succeeds when the form is submitted, the application is vulnerable

### Using CSRF-Blaster for Testing

CSRF-Blaster automates the testing process:

```javascript
const CSRFBlaster = require('csrf-blaster');
const csrfBlaster = new CSRFBlaster({ verbose: true });

async function testForVulnerability() {
  // First, analyze the application
  const targets = await csrfBlaster.generator.analyzeWebsite('https://example.com');
  
  // Test each potential target
  for (const target of targets) {
    const result = await csrfBlaster.test({
      url: target.action,
      method: target.method,
      data: target.fields.reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
      }, {})
    });
    
    console.log(`Target: ${target.action}`);
    console.log(`Result: ${result.success ? 'Potentially Vulnerable' : 'Protected'}`);
    console.log(`Status: ${result.status}`);
    console.log('---');
  }
}
```

## Mitigating CSRF in Your Applications

### General Best Practices

1. **Use anti-CSRF tokens** for all state-changing operations
2. **Set SameSite cookies** to Strict or Lax
3. **Implement proper Content-Type validation**
4. **Use custom request headers** for AJAX requests
5. **Implement proper session management**
6. **Consider using double-submit cookie pattern**
7. **Always verify the HTTP Referer header** (as an additional layer, not sole protection)

### Implementation Recommendations

1. **Use framework-provided CSRF protection:**
   - Express.js: Use `csurf` middleware
   - React: Use libraries like `axios` with CSRF token support
   - Next.js: Use `next-csrf` or similar packages
   - Vue.js/Nuxt.js: Use built-in or community CSRF protection

2. **Set proper cookie attributes:**
   ```
   Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax
   ```

3. **Include CSRF tokens in all forms:**
   ```html
   <form action="/api/update" method="POST">
     <input type="hidden" name="_csrf" value="${csrfToken}">
     <!-- Other form fields -->
   </form>
   ```

4. **Include CSRF tokens in AJAX requests:**
   ```javascript
   fetch('/api/update', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': csrfToken
     },
     body: JSON.stringify(data)
   });
   ```

## Advanced CSRF Scenarios

### CSRF in Single Page Applications

SPAs that store authentication tokens in localStorage are naturally protected from CSRF since cookies aren't used. However, if they use cookie-based authentication, they need CSRF protection.

### CSRF with Cross-Origin Resource Sharing (CORS)

CORS doesn't prevent CSRF attacks on its own. Even with strict CORS policies, if a site uses cookie-based authentication without CSRF tokens, it can be vulnerable.

### CSRF via Clickjacking

Attackers can combine CSRF with clickjacking by placing an invisible iframe over a legitimate button. When the user clicks what they think is a legitimate button, they're actually interacting with the iframe.

### CSRF via XSS

If an application has XSS vulnerabilities, an attacker can bypass CSRF protection by injecting JavaScript that reads the CSRF token from the page and includes it in malicious requests.

## Common Misconceptions About CSRF

1. **"CORS prevents CSRF"** - False. CORS controls what external domains can read responses, not what requests can be sent.
2. **"JSON APIs are immune to CSRF"** - False. While `<form>` elements can't send JSON directly, attackers can still use `fetch()` or `XMLHttpRequest`.
3. **"HTTPS prevents CSRF"** - False. HTTPS prevents eavesdropping but doesn't prevent CSRF.
4. **"Authentication prevents CSRF"** - False. CSRF attacks specifically target authenticated users.

## Conclusion

CSRF vulnerabilities can lead to serious security issues in web applications. By understanding how these attacks work and implementing proper protection mechanisms, you can secure your applications against CSRF attacks.

Remember that CSRF-Blaster is a tool for testing and identifying vulnerabilities, not for exploiting them. Always use this tool ethically and with proper authorization.

## References and Further Reading

1. [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
2. [MDN Web Docs: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
3. [CSRF Attacks: Anatomy, Prevention, and XSRF Tokens](https://portswigger.net/web-security/csrf)
4. [CSRF is Dead (Sort of)](https://scotthelme.co.uk/csrf-is-dead/)
5. [Express.js CSRF Protection](https://www.npmjs.com/package/csurf)