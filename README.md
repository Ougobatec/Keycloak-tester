# Keycloak Tester

A single-page app designed to quickly test Keycloak authentication, check user information, and view generated tokens.

## 🚀 Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Configuration (optional)**:

```bash
# Copy example file
cp .env.example .env

# Modify port if necessary
PORT=3001
```

3. **Start the application**:

```bash
# Default port (3001)
npm run dev

# Custom port via environment variable
PORT=3002 npm run dev
```

## ⚙️ Environment Variables

| Variable | Description             | Default |
| -------- | ----------------------- | ------- |
| `PORT`   | Development server port | `3001`  |

## 📋 Features

### ⚙️ Keycloak Configuration

- **Keycloak URL**: URL of your Keycloak server (e.g., `https://auth.example.com`)
- **Realm**: Name of the realm configured in Keycloak
- **Client ID**: Identifier of the public client configured in Keycloak

### 🔐 Authentication

- **SSO Login**: Login via Keycloak with redirection
- **Logout**: Complete logout with session cleanup
- **Refresh**: Automatic token refresh

### 📊 Token Visualization

- **Access Token**: Access token with decoded payload
- **Refresh Token**: Refresh token
- **ID Token**: Identity token with user information
- **Expiration**: Display of remaining time before expiration
- **Copy**: Buttons to copy tokens to clipboard

### 👤 User Information

- **Profile**: Name, email, username
- **Roles**: Roles assigned in the realm
- **User ID**: Unique user identifier

## 🔧 Keycloak Configuration

### Prerequisites in Keycloak

1. **Create a Client**:
   - Type: `public`
   - Client ID: `keycloak-tester` (or your choice)
   - Root URL: `http://localhost:{PORT}` (URL of your app)
   - Valid redirect URIs: `http://localhost:{PORT}/*`
   - Web origins: `http://localhost:{PORT}`

[Replace `{PORT}` with the port used, e.g., `3001`]

2. **Configure the Client**:
   - Access Type: `public`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants Enabled: `ON` (optional)
   - Web origins: `*` (or specific to your domain)

### Configuration Example

```javascript
{
  url: "https://auth.example.com",
  realm: "master",
  clientId: "keycloak-tester"
}
```

## 📱 Usage

1. **Enter Keycloak configuration** in the fields
2. **Click "Connect"** to start authentication
3. **Log in** via the Keycloak interface
4. **Explore tokens** and user information
5. **Copy tokens** to use in other applications
6. **Refresh** tokens if necessary
7. **Logout** to clean up the session
