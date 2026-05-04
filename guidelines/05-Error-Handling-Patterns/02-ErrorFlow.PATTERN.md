# Error Flow Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"DAO throws DAOError → Controller re-throws or wraps → Route checks instanceof"**
## Flow
### DAO Layer
```javascript
try {
  return await Model.find({ merchantId });
} catch (error) {
  throw new DAOError(`Failed to fetch: ${error.message}`);
}
```
### Controller Layer
```javascript
try {
  const records = await this.dao.findByMerchant(merchantId);
  return records.map(...);
} catch (error) {
  if (error instanceof DAOError || error instanceof ControllerError) {
    throw error; // Re-throw explicit
  }
  throw new ControllerError(`Failed: ${error.message}`); // Wrap implicit
}
```
### Route Layer
```javascript
try {
  const result = await controller.get(merchantId);
  res.json(ResponseUtils.success('Success', result));
} catch (error) {
  if (error instanceof ControllerError || error instanceof DAOError) {
    res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
  } else {
    res.status(500).json(ResponseUtils.error('Operation failed', null));
  }
}
```
---
**Check instanceof in routes to distinguish explicit vs implicit errors**
