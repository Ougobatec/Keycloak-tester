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
   - Root URL : `http://localhost:{PORT}` (URL de votre app)
   - Valid redirect URIs : `http://localhost:{PORT}/*`
   - Web origins : `http://localhost:{PORT}`

[Remplacez `{PORT}` par le port utilisé, ex: `3001`]

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
