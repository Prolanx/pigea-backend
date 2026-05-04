# Environment Variables Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"ALL env vars read ONLY in common/constants/env.constants.js. Never use process.env anywhere else."**
## Pattern
```javascript
// common/constants/env.constants.js
export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI;

// Usage
import { common } from '@common/_index.js';
const port = common.constants.env.PORT;
```
---
**process.env ONLY in env.constants.js - nowhere else**
