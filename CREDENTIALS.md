# BlockEstate System Credentials

## Creating Users Manually

To create users, you can use the registration endpoint or add them directly via MongoDB.

### Option 1: Using API (Recommended)

**Register via POST request:**

```bash
# Register Citizen
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password123",
    "name": "John Citizen",
    "role": "citizen"
  }'

# Register Registrar
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "registrar@example.com",
    "password": "password123",
    "name": "Alice Registrar",
    "role": "registrar"
  }'

# Register Court Officer
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "court@example.com",
    "password": "password123",
    "name": "Judge Robert",
    "role": "court"
  }'

# Register Admin
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "role": "admin"
  }'
```

### Option 2: Using Frontend Registration Page

Visit `http://localhost:5173/login` and use the registration form.

## Your User Accounts

**Save your credentials here:**

### Citizen Account
- **Email**: ____________________________
- **Password**: ____________________________
- **Name**: ____________________________

### Registrar Account
- **Email**: ____________________________
- **Password**: ____________________________
- **Name**: ____________________________

### Court Account
- **Email**: ____________________________
- **Password**: ____________________________
- **Name**: ____________________________

### Admin Account
- **Email**: ____________________________
- **Password**: ____________________________
- **Name**: ____________________________

## Login URLs

- **Main Application**: http://localhost:5173
- **Login Page**: http://localhost:5173/login

After login, you'll be redirected based on your role:
- Citizen → `/citizen/dashboard`
- Registrar → `/registrar/dashboard`
- Court → `/court/dashboard`
- Admin → `/admin/dashboard`

## Notes

- Passwords are hashed using bcrypt (10 rounds)
- All new users start with `verified: false` - Admin must verify them
- Wallet addresses are auto-generated when needed for blockchain transactions
- Use the Admin panel to manage users after creating an admin account
