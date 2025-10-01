# Keycloak Tester

Une application React pour tester et explorer les configurations Keycloak, visualiser les tokens et leurs contenus.

## 🚀 Installation

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configuration (optionnel)** :
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Modifier le port si nécessaire
PORT=3001
```

3. **Lancer l'application** :
```bash
# Port par défaut (3001)
npm run dev

# Port personnalisé via variable d'environnement
PORT=3002 npm run dev
```

## ⚙️ Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `PORT` | Port du serveur de développement | `3001` |
| `VITE_KEYCLOAK_URL` | URL Keycloak par défaut (optionnel) | - |
| `VITE_KEYCLOAK_REALM` | Realm par défaut (optionnel) | - |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID par défaut (optionnel) | - |

## 📋 Fonctionnalités

### ⚙️ Configuration Keycloak
- **URL Keycloak** : URL de votre serveur Keycloak (ex: `https://auth.example.com`)
- **Realm** : Nom du realm configuré dans Keycloak
- **Client ID** : Identifiant du client public configuré dans Keycloak

### 🔐 Authentification
- **Connexion SSO** : Connexion via Keycloak avec redirection
- **Déconnexion** : Déconnexion complète avec nettoyage de session
- **Rafraîchissement** : Rafraîchissement automatique des tokens

### 📊 Visualisation des Tokens
- **Access Token** : Token d'accès avec payload décodé
- **Refresh Token** : Token de rafraîchissement
- **ID Token** : Token d'identité avec informations utilisateur
- **Expiration** : Affichage du temps restant avant expiration
- **Copie** : Boutons pour copier les tokens dans le presse-papier

### 👤 Informations Utilisateur
- **Profil** : Nom, email, username
- **Rôles** : Rôles assignés dans le realm
- **ID Utilisateur** : Identifiant unique de l'utilisateur

## 🔧 Configuration Keycloak

### Prérequis dans Keycloak

1. **Créer un Client** :
   - Type : `public`
   - Client ID : `keycloak-tester` (ou votre choix)
   - Root URL : `http://localhost:5173` (URL de votre app)
   - Valid redirect URIs : `http://localhost:5173/*`
   - Web origins : `http://localhost:5173`

2. **Configurer le Client** :
   - Access Type : `public`
   - Standard Flow Enabled : `ON`
   - Direct Access Grants Enabled : `ON` (optionnel)
   - Web origins : `*` (ou spécifique à votre domaine)

### Exemple de Configuration

```javascript
{
  url: "https://auth.example.com",
  realm: "master", 
  clientId: "keycloak-tester"
}
```

## 📱 Usage

1. **Saisir la configuration** Keycloak dans les champs
2. **Cliquer sur "Se connecter"** pour lancer l'authentification  
3. **Se connecter** via l'interface Keycloak
4. **Explorer les tokens** et informations utilisateur
5. **Copier les tokens** pour les utiliser dans d'autres applications
6. **Rafraîchir** les tokens si nécessaire
7. **Se déconnecter** pour nettoyer la session

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
