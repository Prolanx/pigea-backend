# DAO Error Handling Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"All DAO methods wrap database errors in try/catch and throw DAOError"**
## Pattern
```javascript
async findByMerchant(merchantId) {
  try {
    const records = await Model.find({ merchantId });
    return records;
  } catch (error) {
    throw new DAOError(`Failed to fetch records: ${error.message}`);
  }
}
```
---
**Try/catch in every DAO method - wrap as DAOError**
