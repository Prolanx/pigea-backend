# Query vs Mutation Pattern
## Status
🟡 **REQUIRED**
## Universal Pattern
**"Query (GET) not found = success with null. Mutation (POST/PUT/DELETE) not found = error."**
## Query (GET) - Success
```javascript
const invoice = await dao.findById(id);
if (!invoice) {
  return ResponseUtils.success('Invoice not found or deleted', null);
}
```
## Mutation (DELETE) - Error
```javascript
const invoice = await dao.findById(id);
if (!invoice) {
  throw new ControllerError('Invoice not found', 404);
}
```
---
**Query executed successfully but no data = success. Mutation cannot execute = error**
