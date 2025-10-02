// Application types
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  disableSilentSSO?: boolean;
}

export interface ParsedToken {
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  [key: string]: unknown;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenParsed: ParsedToken;
  refreshTokenParsed?: ParsedToken;
  idTokenParsed?: ParsedToken;
}

// Interface for Keycloak initialization options
export interface KeycloakInitOptions {
  pkceMethod?: 'S256';
  onLoad?: 'login-required' | 'check-sso';
  silentCheckSsoRedirectUri?: string;
  checkLoginIframe?: boolean;
  [key: string]: unknown;
}

// Interface for login options
export interface KeycloakLoginOptions {
  redirectUri?: string;
  prompt?: string;
  [key: string]: unknown;
}

// Interface for Keycloak instance
export interface KeycloakInstance {
  init: (options: KeycloakInitOptions) => Promise<boolean>;
  login: (options?: KeycloakLoginOptions) => void;
  logout: (options?: Record<string, unknown>) => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  clearToken: () => void;
  hasRealmRole: (role: string) => boolean;
  hasResourceRole: (role: string, resource?: string) => boolean;
  loadUserProfile: () => Promise<unknown>;
  authenticated?: boolean;
  token?: string;
  tokenParsed?: ParsedToken;
  refreshToken?: string;
  refreshTokenParsed?: ParsedToken;
  idToken?: string;
  idTokenParsed?: ParsedToken;
}

// Type for Keycloak instance with necessary properties (simplified version for service)
export interface KeycloakInstanceType {
  init: (options: KeycloakInitOptions) => Promise<boolean>;
  login: (options?: Record<string, unknown>) => void;
  logout: (options?: Record<string, unknown>) => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  clearToken: () => void;
  authenticated?: boolean;
  token?: string;
  refreshToken?: string;
  idToken?: string;
  tokenParsed?: ParsedToken;
  idTokenParsed?: ParsedToken;
}
