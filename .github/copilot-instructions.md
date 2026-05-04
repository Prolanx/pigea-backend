# BizFlow Backend - AI Coding Agent Instructions

## Architecture Overview

This is a **feature-based modular Express API** with clean architecture:
- **Pure Controllers**: Framework-agnostic business logic (no Express dependencies)
- **DAO Pattern**: All database operations isolated in Data Access Objects
- **Dependency Injection**: Components instantiated in [server.js](../src/server.js) and injected into controllers
- **Adapter Pattern**: External libraries wrapped in adapters (bcrypt, JWT, nodemailer, express-validator)
- **Route Factories**: Routes created via factory functions that accept controller instances

## Module Structure

Each feature module follows this exact structure (see [invoice module](../src/modules/invoice)):
```
src/modules/<feature>/
├── index.js                    # Exports: DAO, Controller, createRoutes, utilities
├── controllers/*.controller.js # Pure JS business logic, throws ControllerError/DAOError
├── dao/*.dao.js               # Database operations, throws DAOError
├── dto/*.validation.js        # express-validator schemas (arrays of validation chains)
├── routes/
│   ├── index.js              # Combines sub-routes via factory pattern
│   ├── create.routes.js      # POST endpoints
│   ├── read.routes.js        # GET list/aggregate endpoints
│   ├── query.routes.js       # GET single item endpoints
│   ├── update.routes.js      # PUT/PATCH endpoints
│   └── delete.routes.js      # DELETE endpoints
└── utils/*.util.js           # Feature-specific utilities (classes)
```

## Import Paths (CRITICAL)

**Always use ES6 module imports with `#` subpath aliases** (configured in package.json):
```javascript
// ✅ CORRECT
import Account from '#database/models/Account.js';
import { ControllerError } from '#common/errors.js';
import { validateDto } from '#common/middleware/validate-dto.js';
import * as passwordAdapter from '#adapters/password/password.js';

// ❌ WRONG - Never use relative paths for cross-module imports
import Account from '../../../database/models/Account.js';
```

**Available aliases:**
- `#adapters/*` → `src/adapters/*`
- `#common/*` → `src/common/*`
- `#config/*` → `src/config/*`
- `#database/*` → `src/database/*`
- `#modules/*` → `src/modules/*`

**Import rules:**
- Always include `.js` extension
- Use named imports from `#common/validators.js` (body, param, query, validateExpressValidator)
- Import adapters as namespaces: `import * as passwordAdapter from '#adapters/password/password.js'`

## Validation Pattern

**DTO files** export validation schemas as arrays:
```javascript
// dto/create-user.validation.js
import { body } from '#common/validators.js';

const createUserDtoSchema = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password too short')
];

export default createUserDtoSchema;
```

**Routes** apply validation via `validateDto` middleware:
```javascript
import { validateDto } from '#common/middleware/validate-dto.js';
import createUserDtoSchema from '#modules/user/dto/create-user.validation.js';

router.post('/', validateDto(createUserDtoSchema), async (req, res) => { /* ... */ });
```

## Controller Pattern

Controllers are **pure JavaScript classes** with zero Express dependencies:
```javascript
class UserController {
  constructor(userDAO, passwordAdapter) {
    this.userDAO = userDAO;
    this.passwordAdapter = passwordAdapter;
  }
  
  async createUser(userData) {
    try {
      // Business validation
      if (userData.age < 18) {
        throw new ControllerError('User must be 18+', 400);
      }
      
      const hashedPassword = await this.passwordAdapter.hashPassword(userData.password);
      const user = await this.userDAO.create({ ...userData, password: hashedPassword });
      return user;
    } catch (error) {
      if (error instanceof DAOError) throw error;
      throw new ControllerError(`Failed to create user: ${error.message}`);
    }
  }
}
```

**Route handlers** call controller methods and format responses:
```javascript
router.post('/', validateDto(schema), async (req, res) => {
  try {
    const user = await controller.createUser(req.body);
    return res.status(201).json({ status: 'success', message: 'User created', data: user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ status: 'error', message: error.message, data: null });
  }
});
```

## Dependency Injection (server.js)

All components instantiated and wired in [server.js](../src/server.js):
```javascript
// Order matters: inject dependencies from bottom-up
const productDAO = new ProductDAO();
const categoryDAO = new CategoryDAO();
const categoryController = new CategoryController(categoryDAO, productDAO); // productDAO for cascade ops

app.use('/api/categories', createCategoryRoutes(categoryController));
```

## Database Patterns

**DAO classes** handle all Mongoose operations:
```javascript
class UserDAO {
  async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      throw new DAOError(`Failed to create user: ${error.message}`);
    }
  }
}
```

**Transactions** for multi-model operations (see [account.dao.js](../src/modules/auth/dao/account.dao.js)):
```javascript
async createMerchantWithDefaults(accountData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [account] = await Account.create([accountData], { session });
    await Category.create([{ merchantId: account._id, isDefault: true }], { session });
    await session.commitTransaction();
    return account;
  } catch (error) {
    await session.abortTransaction();
    throw new DAOError(`Transaction failed: ${error.message}`);
  } finally {
    session.endSession();
  }
}
```

**Models** are plain Mongoose schemas in `src/database/models/`:
```javascript
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({ /* ... */ }, { timestamps: true });
export default mongoose.model('User', userSchema);
```

**Mongoose population guideline (IMPORTANT)**
- When a field references another model, define it as `mongoose.Schema.Types.ObjectId` with the appropriate `ref` (for example `{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }`).
- DAOs should fetch referenced documents using Mongoose's built-in `.populate()` (e.g., `Invoice.find(query).populate('customerId')`) instead of doing ad-hoc lookups in controllers.
- When populating a document that embeds custom-field values (Contact), also populate its `contactTypeId` so the controller/transformer can map custom field IDs to human-friendly names.
- Controllers should rely on the DAO returning populated documents (and only call other DAOs directly for existence checks in create/update flows). This ensures consistent, performant, and idiomatic use of Mongoose population across the codebase.
- API responses MUST transform contact `data` keys from internal field IDs to the field `name` (e.g. `{ "phone": "..." }`) so clients always receive stable, human-friendly keys. System fields remain `sys_*`.

Example DAO pattern:
```javascript
// In a DAO method - populate Contact AND its ContactType
return await Invoice.find(query).populate({ path: 'customerId', populate: { path: 'contactTypeId', select: 'name fields' } });
```

Example controller usage:
```javascript
const invoice = await this.invoiceDAO.findById(id); // invoice.customerId is populated (including contactTypeId)
// Use a shared transformer to map contact.data keys from field-id -> field-name
const customer = buildCustomerResponseFromContact(invoice.customerId);
```

## Error Handling

Two custom error types ([common/errors.js](../src/common/errors.js)):
- **ControllerError**: Business logic errors (validation, not found, etc.)
- **DAOError**: Database operation failures

Both accept `(message, statusCode = 500)`. Controllers re-throw DAOErrors, routes use `error.statusCode`.

## Authentication

- JWT access tokens (15min) + refresh tokens (7 days)
- Middleware: `authenticate` from [auth.middleware.js](../src/common/middleware/auth.middleware.js)
- Authorization: `authorize(['merchant'])` - checks `req.user.role`
- Protected routes: `router.get('/', authenticate, authorize(['merchant']), handler)`
- Adapters wrap bcrypt and jsonwebtoken (see `#adapters/password` and `#adapters/jwt`)

## Development Workflow

**Run commands:**
```bash
npm run dev      # Development with nodemon
npm start        # Production
```

**Environment:** Copy `.env.example` to `.env`, configure:
- `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `EMAIL_USER`, `EMAIL_PASSWORD` (for verification emails)

**Testing API:** Use `.http` files in `rest-client/` with REST Client extension

## Adding New Features

1. **Create module folder:** `src/modules/feature/`
2. **Add subdirectories:** controllers, dao, dto, routes, utils
3. **Create model:** `src/database/models/Feature.js`
4. **Export from index:** `export { FeatureDAO, FeatureController, createFeatureRoutes };`
5. **Wire in server.js:**
   ```javascript
   import { FeatureDAO, FeatureController, createFeatureRoutes } from '#modules/feature/index.js';
   const featureDAO = new FeatureDAO();
   const featureController = new FeatureController(featureDAO);
   app.use('/api/features', createFeatureRoutes(featureController));
   ```

## Key Conventions

- **Route naming:** `create*.routes.js`, `read*.routes.js`, `update*.routes.js`, `delete*.routes.js`, `query*.routes.js`
- **File exports:** Use default exports for single-purpose files (controllers, DAOs, route factories)
- **Factory pattern:** Routes are created via `function createXRoutes(controller) { return router; }`
- **No global state:** Everything injected, no singleton DAOs/Controllers
- **Response format:** `{ status: 'success|error', message: string, data: any }`
- **Utilities as classes:** InvoiceCalculator, TokenGenerator (instantiated in server.js if needed)

## Cross-Module Dependencies

When modules depend on each other:
- **Inject both DAOs into controller** (see CategoryController getting ProductDAO for cascade deletes)
- **Order instantiation carefully** in server.js
- **Document dependency reason** in controller constructor

See [category.controller.js](../src/modules/category/controllers/category.controller.js) for example of cross-DAO operations.
