# Controller Error Handling Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"Controllers catch errors, re-throw explicit (DAOError/ControllerError), wrap implicit as ControllerError"**
## Pattern
```javascript
async getResource(id, merchantId) {
  try {
    const resource = await this.dao.findById(id, merchantId);
    if (!resource) {
      throw new ControllerError('Resource not found', 404);
    }
    return resource;
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error; // Re-throw explicit
    }
    throw new ControllerError(`Failed: ${error.message}`); // Wrap implicit
  }
}
```
---
**Controllers distinguish between explicit and implicit errors**
