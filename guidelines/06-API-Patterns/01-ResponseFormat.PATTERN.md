# Response Format Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"All responses: { status: 'success' | 'error', message: string, data: any | null }"**
## Format
```javascript
// Success
{
  status: 'success',
  message: 'User created successfully',
  data: { id: '123', email: 'user@example.com' }
}

// Error
{
  status: 'error',
  message: 'Email already exists',
  data: null
}
```
---
**Controllers construct response shape, routes just send it**
