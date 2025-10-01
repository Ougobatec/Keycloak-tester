// Types pour l'application
export interface MockConfig {
  url: string;
  realm: string;
  clientId: string;
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
  [key: string]: unknown;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenParsed: ParsedToken;
  idTokenParsed: ParsedToken;
}