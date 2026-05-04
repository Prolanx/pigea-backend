# Custom Error Classes Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"Use ControllerError for business logic errors, DAOError for database errors"**
## Custom Classes
```javascript
// common/errors/errors.js
class ControllerError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ControllerError';
    this.type = 'CONTROLLER_ERROR';
    this.statusCode = statusCode;
  }
}

class DAOError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'DAOError';
    this.type = 'DAO_ERROR';
    this.statusCode = statusCode;
  }
}
```
## Usage
```javascript
// Controller
throw new ControllerError('User not found', 404);

// DAO
throw new DAOError('Failed to query database', 500);
```
---
**ControllerError = business logic. DAOError = database**
