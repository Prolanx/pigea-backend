# Try/Catch Strategy Pattern
## Status
🔴 **CRITICAL**
## Universal Pattern
**"Every layer (DAO, Controller, Route) must have try/catch to catch implicit errors and know error origin"**
## Purpose
- Know WHERE error originated (DAO vs Controller vs Route)
- Catch implicit errors (typos, undefined variables)
- Convert implicit to explicit errors
## Pattern
ALL layers have try/catch:
- DAO: Wrap as DAOError
- Controller: Re-throw explicit, wrap implicit as ControllerError
- Route: Check instanceof, use operation-specific fallback
---
**Try/catch everywhere ensures error traceability**
