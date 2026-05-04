# Invoice Module API Contract (Frontend Guide)

This document describes the invoice creation DTO and status transition behavior that frontend should rely on.

## 1. Create invoice DTO (`POST /invoices`)

Allowed payload fields:
- `customerId` (string, required, Mongo ID)
- `customerEmail` (string, required, valid email)
- `invoiceCategory` (string, required: `service` or `ecommerce`)
- `currency` (string, optional, fallback `USD`)
- `orderId` (string, optional)
- `fulfillmentStatus` (string, optional; required for ecommerce invoices at controller level)
- `issueDate` (ISO8601 date, required)
- `dueDate` (ISO8601 date, required)
- `items` (array, required, min 1 item)

Item-level validation behavior:
- `items.*.itemCategory` required (`service` or `ecommerce`)
- All items must match `invoiceCategory`
- `items.*.name` required
- `items.*.quantity` required, numeric, non-negative
- `items.*.unitPrice` optional but if present must be non-negative numeric
- For `service` items, `unitPrice` is required
- For `ecommerce` items, `productId` is required

Accepted envelope fields for ticketing:
- `status` (optional) => allowed values: `auto`, `draft` (mapped internally)
- `type` (optional) => allowed values: `automatic`, `manual`
- `notes` (optional, trimmed string)


## 2. Status mapping at creation

In `createInvoiceAction`:
- `status: auto` => normalized to `unpaid`; invoice is immediately sent (email attempt is done, and `auditTrail` entry action = `sent`).
- `status: draft` => normalized to `draft`; no outgoing invoice email is sent (`auditTrail` entry action = `drafted`).

If missing, the default initial status is `draft`.


## 3. Persistent status history (in DB)

Invoice schema includes:
- `status` (current status)
- `statusHistory` array (`{ status, changedAt }`)
- `auditTrail` array (`{ action, changedAt, metadata }`)

Every status-affecting controller path appends to statusHistory:
- Create: initial status entry
- `processInvoicePaymentAction`: `paid` on success, `unpaid` fallback on failure
- `updateInvoiceStatusAction`: enforce transitions via `STATUS_TRANSITIONS`


## 4. Allowed status transitions (from backend `STATUS_TRANSITIONS`)

- `new` -> `sent`, `cancelled`
- `sent` -> `re-issued`, `paid`, `cancelled`
- `overdue` -> `re-issued`, `cancelled`
- `re-issued` -> `paid`, `cancelled`
- `paid` -> (none)
- `cancelled` -> (none)

`processInvoicePaymentAction` is a separate payment endpoint and sets status to `paid` on successful payment only.


## 5. Overdue status derivation (formatting output)

The formatted API response includes `overdue` derived boolean only when:
- invoice status is `unpaid`
- `dueDate` is in the past


## 6. Frontend recipe

- Create invoice as `status=auto` for send & email flow, or `status=draft` for work-in-progress.
- Handle required `items` and per-item properties according to the schema.
- Use `/invoices/:id/status` updates for manual transitions (sent, re-issued, cancelled).
- Use `/invoices/pay` to process payments; success sets `paid`, failure remains `unpaid` with error details.

