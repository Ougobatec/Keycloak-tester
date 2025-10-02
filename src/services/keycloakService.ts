import type { KeycloakConfig, TokenInfo, ParsedToken, KeycloakInitOptions, KeycloakInstanceType } from '../types';

// Keycloak service
class KeycloakService {
  private keycloak: KeycloakInstanceType | null = null;

  // Initialize Keycloak
  async initKeycloak(config: KeycloakConfig, disableSilentSSO: boolean = false): Promise<void> {
    try {
      // Dynamic import of keycloak-js
      const Keycloak = (await import('keycloak-js')).default;

      this.keycloak = new Keycloak({
        url: config.url,
        realm: config.realm,
        clientId: config.clientId,
      }) as KeycloakInstanceType;

      const initOptions: KeycloakInitOptions = {
        pkceMethod: 'S256',
      };

      if (disableSilentSSO) {
        // No silent SSO - check first without redirection
        initOptions.onLoad = 'check-sso';
      } else {
        // Silent SSO enabled
        initOptions.onLoad = 'check-sso';
        initOptions.silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';
      }

      const authenticated = await this.keycloak.init(initOptions);

      // If not authenticated and we have login return parameters in the URL
      if (!authenticated && (window.location.search.includes('state=') || window.location.hash.includes('state='))) {
        // There was a login attempt, clean the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Keycloak error:', error);
      throw new Error(`Keycloak initialization error: ${error}`);
    }
  }

  // Login
  async login(): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized');
    }

    return this.keycloak.login({
      redirectUri: window.location.origin,
    });
  }

  // Logout
  async logout(): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized');
    }

    return this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  // Refresh token
  async refreshToken(): Promise<{ refreshed: boolean; message: string }> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized');
    }

    if (!this.keycloak.authenticated) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Attempting token refresh...');
      // updateToken returns true if token was refreshed, false if still valid
      const refreshed = await this.keycloak.updateToken(5); // Force refresh even if valid for 5 more seconds

      if (refreshed) {
        console.log('Token refreshed successfully');
        return { refreshed: true, message: 'Tokens refreshed successfully' };
      } else {
        console.log('Tokens still valid, no refresh needed');
        return { refreshed: false, message: 'Tokens still valid, no refresh needed' };
      }
    } catch (error) {
      console.error('updateToken error:', error);
      throw new Error(`Error refreshing token: ${error}`);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.keycloak?.authenticated || false;
  }

  // Get token information
  getTokenInfo(): TokenInfo | null {
    if (!this.keycloak || !this.keycloak.authenticated) {
      return null;
    }

    return {
      accessToken: this.keycloak.token || '',
      refreshToken: this.keycloak.refreshToken || '',
      idToken: this.keycloak.idToken || '',
      tokenParsed: this.keycloak.tokenParsed || ({} as ParsedToken),
      idTokenParsed: this.keycloak.idTokenParsed || ({} as ParsedToken),
    };
  }

  // Get user roles
  getUserRoles(): string[] {
    if (!this.keycloak?.tokenParsed?.realm_access?.roles) {
      return [];
    }
    return this.keycloak.tokenParsed.realm_access.roles;
  }

  // Check if user has a specific role
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  // Clean up instance
  clearKeycloak(): void {
    if (this.keycloak) {
      this.keycloak.clearToken();
      this.keycloak = null;
    }
  }
}

// Singleton instance
export const keycloakService = new KeycloakService();
