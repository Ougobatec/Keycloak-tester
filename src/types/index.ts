// Types pour l'application
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  disableSilentSSO?: boolean;
}

export interface ParsedToken {
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  family_name?: string;
  given_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  [key: string]: unknown;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenParsed: ParsedToken;
  idTokenParsed: ParsedToken;
}

// Interface pour l'instance Keycloak
export interface KeycloakInstance {
  init: (options: any) => Promise<boolean>;
  login: (options?: any) => void;
  logout: (options?: any) => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  clearToken: () => void;
  hasRealmRole: (role: string) => boolean;
  hasResourceRole: (role: string, resource?: string) => boolean;
  loadUserProfile: () => Promise<any>;
  authenticated?: boolean;
  token?: string;
  tokenParsed?: ParsedToken;
  refreshToken?: string;
  idToken?: string;
  idTokenParsed?: ParsedToken;
  timeSkew?: number;
  loginRequired?: boolean;
  authServerUrl?: string;
  realm?: string;
  clientId?: string;
  subject?: string;
  sessionId?: string;
}