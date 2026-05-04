# Backend Development Reference - Master Index

This is the **single source of truth** for all backend development patterns, guidelines, and best practices. **All code must comply with these references.**

---

## 🤖 INSTRUCTIONS FOR AI ASSISTANTS (Copilot, Claude, etc.)

### How to Traverse This Reference

When implementing any feature, fix, or audit, you **must** read and apply guidelines in the following order:

**Step 1: Follow folder order** - Process folders numerically (01 → 02 → 03 → 04 → 05 → 06 → 07 → 08)

**Step 2: Follow file order within each folder** - Within each folder, process files numerically (01 → 02 → 03 → ...)

**Full traversal order:**
```
01-Master-Index/
  01-INDEX.md                          ← Start here (you are here)

02-Architecture-Patterns/
  01-ProjectStructure.PATTERN.md       ← Read first in folder
  02-ModuleStructure.PATTERN.md
  03-AppDirectory.PATTERN.md
  04-ServerBootstrap.PATTERN.md
  05-DependencyInjection.PATTERN.md
  06-ModuleFileOrganization.PATTERN.md  ← Read last in folder

03-Configuration-Patterns/
  01-EnvironmentVariables.PATTERN.md
  02-ConstantsManagement.PATTERN.md
  03-ZeroHardcoding.PATTERN.md

04-Import-Export-Patterns/
  01-AbsoluteImports.PATTERN.md
  02-NamespaceExports.PATTERN.md
  03-UnderscoreIndex.PATTERN.md

05-Error-Handling-Patterns/
  01-CustomErrorClasses.PATTERN.md
  02-ErrorFlow.PATTERN.md
  03-TryCatchStrategy.PATTERN.md

06-API-Patterns/
  01-ResponseFormat.PATTERN.md
  02-QueryVsMutation.PATTERN.md
  03-RouteFactory.PATTERN.md
  04-ValidationPattern.PATTERN.md
  05-ResponseUtility.PATTERN.md

07-Data-Access-Patterns/
  01-DAOStructure.PATTERN.md
  02-DAOErrorHandling.PATTERN.md
  03-DatabaseConnection.PATTERN.md

08-Controller-Patterns/
  01-ControllerStructure.PATTERN.md
  02-ControllerErrorHandling.PATTERN.md
  03-BusinessLogicSeparation.PATTERN.md
```

### Rules for AI Assistants

1. **Always read this INDEX first** before generating any code
2. **Process ALL relevant folders** - do not skip any folder
3. **Process files in numbered order** within each folder
4. **Every pattern is mandatory** - do not ignore or partially apply any guideline
5. **When in conflict** - earlier numbered patterns take priority
6. **When auditing** - check compliance against ALL patterns across ALL folders at once

---

## 🚨 CRITICAL RULES (Read Before Any Code)

1. **Reference Module is Law** - Every operation must follow guidelines documented here
2. **Absolute Imports Only** - Use `@` prefix, never relative imports
3. **Namespace Exports** - Everything exports via `_index.js` as single namespace
4. **Never Destructure in Imports** - Import namespace, then destructure
5. **All Env Vars Through Constants** - Never use `process.env` directly
6. **Zero Hardcoding** - No hardcoded strings, messages, or values anywhere
7. **Custom Error Classes** - Use `ControllerError` and `DAOError`
8. **Try/Catch in Every Layer** - DAO, Controller, Route - all have error handling
9. **Response Shape Standard** - `{ status, message, data }` everywhere

---

## 📐 02 - Architecture Patterns

**Core structural patterns for organizing the backend**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | ProjectStructure | ⭐ Source directory organization |
| 02 | ModuleStructure | Standard module directory layout |
| 03 | AppDirectory | Dependencies, middleware, routes, startup |
| 04 | ServerBootstrap | Bootstrap sequence and orchestration |
| 05 | DependencyInjection | Central DI container pattern |
| 06 | ModuleFileOrganization | ⭐ One file per operation (all layers) |

---

## ⚙️ 03 - Configuration Patterns

**Environment and configuration management**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | EnvironmentVariables | ⭐ All env vars through common.constants.env |
| 02 | ConstantsManagement | Centralized constants structure |
| 03 | ZeroHardcoding | ⭐ No hardcoded strings/messages anywhere |

---

## 📦 04 - Import/Export Patterns

**Module importing and exporting standards**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | AbsoluteImports | ⭐ Always use @ prefix, never relative |
| 02 | NamespaceExports | ⭐ Single namespace export pattern |
| 03 | UnderscoreIndex | ⭐ Use _index.js everywhere |

---

## ⚠️ 05 - Error Handling Patterns

**Error management and flow**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | CustomErrorClasses | ⭐ ControllerError and DAOError |
| 02 | ErrorFlow | ⭐ DAO → Controller → Route flow |
| 03 | TryCatchStrategy | Try/catch in every layer |

---

## 🌐 06 - API Patterns

**HTTP API design and implementation**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | ResponseFormat | ⭐ Standard { status, message, data } |
| 02 | QueryVsMutation | Not found handling (query vs mutation) |
| 03 | RouteFactory | Route factory dependency injection |
| 04 | ValidationPattern | DTOs with express-validator |
| 05 | ResponseUtility | ResponseUtils.success/error |

---

## 💾 07 - Data Access Patterns

**Database access and DAO layer**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | DAOStructure | Standard DAO organization |
| 02 | DAOErrorHandling | Wrapping database errors |
| 03 | DatabaseConnection | Database lifecycle management |

---

## 🎮 08 - Controller Patterns

**Business logic and controller layer**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | ControllerStructure | Controller class organization |
| 02 | ControllerErrorHandling | Error handling in controllers |
| 03 | BusinessLogicSeparation | Separating business logic concerns |

---

## 🔄 Workflow

### For New Features
1. Read this INDEX
2. Traverse folders 02 → 08 in order
3. Within each folder read files 01 → last in order
4. Apply ALL relevant patterns before writing code

### For Code Reviews
1. Check compliance with all relevant patterns in folder order
2. Verify absolute imports (04-01)
3. Verify namespace exports (04-02)
4. Verify error handling (05-01, 05-02, 05-03)
5. Verify response format (06-01)

### For Audits
1. Use modules/ directory as source of truth for resources
2. Check ALL resources at once (not one-by-one)
3. Verify compliance with EVERY pattern across ALL folders
4. Document violations and remediation plan

---

## 🎯 Priority Order

When in doubt, follow this priority:

1. **04-01 Absolute Imports** - Always use @ prefix
2. **04-02 Namespace Exports** - Single namespace via _index.js
3. **03-01 Environment Variables** - All env through constants
4. **05-01 Custom Error Classes** - Use ControllerError/DAOError
5. **06-01 Response Format** - Standard { status, message, data }
6. **Remaining patterns** - As applicable

---

## 📝 Adding New Patterns

When adding new patterns:
1. Place file in appropriate category folder
2. Number it sequentially within that folder
3. Update this INDEX.md table for that category
4. Include examples and audit checklist
5. Reference related patterns

---

**Version:** 1.0.0  
**Status:** Active - All code must comply
