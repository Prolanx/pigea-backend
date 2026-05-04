# Response Utility Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"Use ResponseUtils.success/error to construct all response shapes"**
## Utility
```javascript
// common/utilities/response.js
export const ResponseUtils = {
  success: (message, data = null) => ({
    status: 'success',
    message,
    data
  }),
  
  error: (message, data = null) => ({
    status: 'error',
    message,
    data
  })
};

// Usage
return ResponseUtils.success('Login successful', { user, token });
res.json(ResponseUtils.error('Login failed', null));
```
---
**Never manually construct response shape - always use utility**
