import type { ParsedToken, TokenInfo, MockConfig } from '../types';

// Données mockées pour les tests et la démonstration
export const MOCK_PARSED_TOKEN: ParsedToken = {
  exp: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
  iat: Math.floor(Date.now() / 1000),
  iss: 'https://auth.example.com/realms/master',
  sub: '123e4567-e89b-12d3-a456-426614174000',
  email: 'jean.dupont@example.com',
  name: 'Jean Dupont',
  preferred_username: 'jdupont',
  realm_access: {
    roles: ['user', 'admin', 'viewer']
  }
};

export const MOCK_TOKENS: TokenInfo = {
  accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrYkY3OE9jVFhEWnVpM0VUQkNXRVJvYV9XdU5YZDBvRGdGQ3d5T0JJMmJ3In0.eyJleHAiOjE3Mjc4MTM5MDAsImlhdCI6MTcyNzgxMzYwMCwianRpIjoiMGM3ZmQ1MTUtNzBiOC00MTc2LWE5ZWMtNzY1YjY4ZmVlOWVmIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmV4YW1wbGUuY29tL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibXktY2xpZW50In0.example_signature_here',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Mjc4OTk5MDAsImlhdCI6MTcyNzgxMzYwMCwianRpIjoicmVmcmVzaC10b2tlbi1pZCIsInR5cCI6IlJlZnJlc2gifQ.refresh_signature_here',
  idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrYkY3OE9jVFhEWnVpM0VUQkNXRVJvYV9XdU5YZDBvRGdGQ3d5T0JJMmJ3In0.eyJleHAiOjE3Mjc4MTM5MDAsImlhdCI6MTcyNzgxMzYwMCwianRpIjoiaWQtdG9rZW4taWQiLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20vcmVhbG1zL21hc3RlciIsImF1ZCI6Im15LWNsaWVudCIsInN1YiI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsInR5cCI6IklEIiwiZW1haWwiOiJqZWFuLmR1cG9udEBleGFtcGxlLmNvbSIsIm5hbWUiOiJKZWFuIER1cG9udCIsInByZWZlcnJlZF91c2VybmFtZSI6ImpkdXBvbnQifQ.id_signature_here',
  tokenParsed: MOCK_PARSED_TOKEN,
  idTokenParsed: MOCK_PARSED_TOKEN
};

// Configuration par défaut
export const DEFAULT_CONFIG: MockConfig = {
  url: '',
  realm: '',
  clientId: ''
};

// Fonction pour obtenir la configuration initiale (depuis le storage ou défaut)
export const getInitialConfig = (): MockConfig => {
  // Cette fonction sera utilisée côté client pour éviter les erreurs SSR
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('keycloak-tester-config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Impossible de charger la configuration sauvegardée:', error);
    }
  }
  return DEFAULT_CONFIG;
};