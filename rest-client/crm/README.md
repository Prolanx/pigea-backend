# CRM REST Client Tests

Test files for the BizFlow CRM module using REST Client extension for VS Code.

## Overview

The CRM module provides a flexible field-based system for managing contacts and communications:

- **Field Bank**: System-provided + custom merchant-defined fields
- **Contact Types**: Templates defining required/optional fields for different contact categories
- **Contacts**: Actual contact records with dynamic data based on their type
- **Messages**: Email communications with contacts

## Setup

1. Start the server: `npm run dev`
2. Install REST Client extension for VS Code
3. Create a merchant account using [authentication/auth-signup-login.http](../authentication/auth-signup-login.http)
4. Copy your access token and replace `YOUR_MERCHANT_ACCESS_TOKEN_HERE` in test files

## Testing Flow

### 1. Field Definitions (`fields.http`)

Start by creating custom fields for your business:

```http
POST /api/crm/fields
{
  "fieldId": "industry",
  "name": "Industry",
  "type": "text"
}
```

**System fields** (always available, no creation needed):
- `sys_name`, `sys_email`

**Field types**:
- `text`: Free-form text input
- `select`: Dropdown with predefined options (requires `options` array)
- `date`: Date value

### 2. Contact Types (`contact-types.http`)

Create templates for different contact categories:

```http
POST /api/crm/contact-types
{
  "name": "B2B Client",
  "description": "Business customers",
  "fields": [
    { "fieldId": "sys_name", "required": true },
    { "fieldId": "sys_email", "required": true },
    { "fieldId": "industry", "required": false }
  ]
}
```

**Use cases**:
- B2B Clients - business contacts
- Individual Customers - personal details only
- Newsletter Subscribers - just email
- Job Applicants - resume, skills, experience
- Event Attendees - ticket type, dietary restrictions

### 3. Contacts (`contacts.http`)

Create contact records in two ways:

**Manual entry** (authenticated):
```http
POST /api/crm/contacts
Authorization: Bearer <token>
{
  "contactTypeId": "...",
  "data": {
    "sys_name": "John Doe",
    "sys_email": "john@example.com"
  }
}
```

**Public form submission** (no authentication):
```http
POST /api/crm/contacts/submit/:merchantId/:contactTypeId
{
  "data": {
    "sys_name": "Jane Doe",
    "sys_email": "jane@example.com"
  }
}
```

**Contact statuses**:
- `New` - Just created (default)
- `Contacted` - First outreach sent
- `Converted` - Became a customer
- `Lost` - Did not convert

**Contact sources**:
- `Manual` - Created by merchant
- `WebsiteForm` - Submitted via public endpoint

### 4. Messages (`messages.http`)

Send emails and view communication history:

```http
POST /api/crm/messages/send
{
  "contactId": "...",
  "body": "Thank you for your interest!"
}
```

**Automated behaviors**:
- Email sent via configured email adapter
- Contact status auto-updates to `Contacted` on first reply
- Message history tracked with timestamps

## Key Concepts

### Dynamic Data Storage

Contact data is stored as JSON, validated against the contact type's field definitions:

```javascript
// Contact Type defines structure
fields: [
  { fieldId: "sys_email", required: true },
  { fieldId: "industry", required: false }
]

// Contact data must match
data: {
  sys_email: "user@example.com",  // Required, must be present
  industry: "SaaS"                 // Optional, can be omitted
  // Cannot add fields not in contact type
}
```

### Validation Rules

1. **Required fields**: Must be present in contact data
2. **Allowed fields**: Only fields defined in contact type can be set
3. **Unique email**: `sys_email` must be unique per merchant (if present)
4. **Field existence**: All fieldIds must exist (system or custom)
5. **Select options**: For select fields, value must match one of the options

### Authorization

- All endpoints require merchant authentication **except** public form submission
- Merchants can only access their own data (scoped by `merchantId`)
- Routes use `authenticate` + `authorize(['merchant'])` middleware

## Error Testing

Each test file includes error scenarios:

- Creating fields with system fieldId prefix (`sys_`)
- Select fields without options
- Contact types with non-existent fields
- Contacts missing required fields
- Contacts with extra fields not in type
- Duplicate email addresses
- Sending messages to non-existent contacts

## Example Workflow

1. **Setup Fields**:
   ```
   Create custom field: "industry" (text)
   Create custom field: "budget" (select: Small/Medium/Large)
   ```

2. **Define Contact Type**:
   ```
   Create "Lead" type with: name, email, company, industry, budget
   Set firstName, email, company as required
   ```

3. **Embed Form on Website**:
   ```html
   <form action="/api/crm/contacts/submit/:merchantId/:leadTypeId" method="POST">
     <!-- Form fields matching contact type -->
   </form>
   ```

4. **Process Submissions**:
   ```
   View new leads: GET /api/crm/contacts?status=New
   Send reply: POST /api/crm/messages/send
   Update status: PATCH /api/crm/contacts/:id { status: "Contacted" }
   ```

## Common Use Cases

### E-commerce Store
- Contact Type: "Customer"
- Fields: name, email, phone, address, preferred_shipping

### SaaS Product
- Contact Type: "Trial User"
- Fields: name, email, company, industry, team_size, use_case

### Event Management
- Contact Type: "Attendee"
- Fields: name, email, ticket_type, dietary_restrictions, t_shirt_size

### Real Estate
- Contact Type: "Buyer Lead"
- Fields: name, email, phone, budget_range, preferred_location, property_type

## Environment Variables

Ensure these are set in `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

Required for sending actual emails via the message system.
