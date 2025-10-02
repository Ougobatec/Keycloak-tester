import type { KeycloakConfig, TokenInfo, ParsedToken } from '../types';

// Service Keycloak réel
class KeycloakService {
  private keycloak: any = null;

  // Initialiser Keycloak
  async initKeycloak(config: KeycloakConfig, disableSilentSSO: boolean = false): Promise<void> {
    try {
      // Import dynamique de keycloak-js
      const Keycloak = (await import('keycloak-js')).default;
      
      this.keycloak = new Keycloak({
        url: config.url,
        realm: config.realm,
        clientId: config.clientId,
      });

      const initOptions: any = {
        pkceMethod: 'S256'
      };

      if (disableSilentSSO) {
        // Pas de SSO silencieux - vérifier d'abord sans redirection
        initOptions.onLoad = 'check-sso';
      } else {
        // SSO silencieux activé
        initOptions.onLoad = 'check-sso';
        initOptions.silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';
      }

      const authenticated = await this.keycloak.init(initOptions);
      
      // Si pas authentifié et qu'on a des paramètres de retour de connexion dans l'URL
      if (!authenticated && (window.location.search.includes('state=') || window.location.hash.includes('state='))) {
        // Il y a eu une tentative de connexion, nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Erreur Keycloak:', error);
      throw new Error(`Erreur d'initialisation Keycloak: ${error}`);
    }
  }

  // Connexion
  async login(): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak non initialisé');
    }
    
    return this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  // Déconnexion
  async logout(): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak non initialisé');
    }
    
    return this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  // Rafraîchir le token
  async refreshToken(): Promise<{ refreshed: boolean; message: string }> {
    if (!this.keycloak) {
      throw new Error('Keycloak non initialisé');
    }
    
    if (!this.keycloak.authenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('Tentative de rafraîchissement du token...');
      // updateToken retourne true si le token a été rafraîchi, false s'il est encore valide
      const refreshed = await this.keycloak.updateToken(5); // Forcer le rafraîchissement même si valide encore 5 secondes
      
      if (refreshed) {
        console.log('Token rafraîchi avec succès');
        return { refreshed: true, message: 'Tokens rafraîchis avec succès' };
      } else {
        console.log('Tokens encore valides, aucun rafraîchissement nécessaire');
        return { refreshed: false, message: 'Tokens encore valides, aucun rafraîchissement nécessaire' };
      }
    } catch (error) {
      console.error('Erreur updateToken:', error);
      throw new Error(`Erreur lors du rafraîchissement du token: ${error}`);
    }
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.keycloak?.authenticated || false;
  }

  // Obtenir les informations des tokens
  getTokenInfo(): TokenInfo | null {
    if (!this.keycloak || !this.keycloak.authenticated) {
      return null;
    }

    return {
      accessToken: this.keycloak.token || '',
      refreshToken: this.keycloak.refreshToken || '',
      idToken: this.keycloak.idToken || '',
      tokenParsed: this.keycloak.tokenParsed || {} as ParsedToken,
      idTokenParsed: this.keycloak.idTokenParsed || {} as ParsedToken
    };
  }

  // Obtenir les rôles de l'utilisateur
  getUserRoles(): string[] {
    if (!this.keycloak?.tokenParsed?.realm_access?.roles) {
      return [];
    }
    return this.keycloak.tokenParsed.realm_access.roles;
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  // Nettoyer l'instance
  clearKeycloak(): void {
    if (this.keycloak) {
      this.keycloak.clearToken();
      this.keycloak = null;
    }
  }
}

// Instance singleton
export const keycloakService = new KeycloakService();