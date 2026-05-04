# REST Client Files for BizFlow Backend API

This folder contains HTTP request files for testing the API using the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension.

## Setup

1. **Install REST Client Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "REST Client"
   - Install the extension by Humao

2. **Start the Server**
   ```bash
   npm run dev
   ```

3. **Update Variables**
   - Each `.http` file has variables at the top
   - Update `@baseUrl` if your server runs on a different port
   - Update `@accessToken` and `@refreshToken` with actual tokens after login

## Files

### `auth-signup-login.http`
- **Signup**: Register new merchant/customer accounts
- **Login**: Login with email and password
- Test cases for verified/unverified accounts, invalid credentials, validation errors

### `auth-verification.http`
- **Verify Email**: Verify account with 6-digit code
- **Resend Verification**: Request new verification code
- Test cases for valid/invalid/expired tokens

### `auth-refresh-logout.http`
- **Refresh Token**: Get new access token using refresh token
- **Logout**: Invalidate refresh token
- Test cases for valid/invalid tokens, authentication

### Invoice files
- `invoice-read.http` - GET `/api/invoices/list` (returns latest versions)
- `invoice-get.http` - GET `/api/invoices/info/:id` (single version)
- `invoice-versions.http` - GET `/api/invoices/info/:id/versions` (version history)
- `invoice-create.http` - POST `/api/invoices` (create invoice)
- `invoice-update.http` - PUT `/api/invoices/:id` (create a new version)
- `invoice-status.http` - PATCH `/api/invoices/:id/status` (update status for a specific version)
- `invoice-delete.http` - DELETE `/api/invoices/:id` (hard delete all versions)

`Note:` All invoice mutation endpoints require an authenticated merchant access token.

## How to Use

1. Open any `.http` file in VS Code
2. Click on "Send Request" above any request
3. View the response in a split pane
4. Copy tokens from responses to use in subsequent requests

## Example Workflow

1. **Register**: Send signup request → Check email for verification code
2. **Verify**: Use 6-digit code in verify-email request
3. **Login**: Login with credentials → Copy `accessToken` from response
4. **Use Token**: Add token to `@accessToken` variable for protected routes
5. **Refresh**: When token expires, use refresh-token endpoint
6. **Logout**: Invalidate refresh token when done

## Tips

- Use `###` to separate requests
- Variables are defined with `@variableName = value`
- Use `{{variableName}}` to reference variables
- Responses are shown in a new editor tab
- You can save responses for later reference
