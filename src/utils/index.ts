import type { TokenInfo, MockConfig } from '../types';
import { MOCK_TOKENS } from '../data/mockData';

// Clé pour le localStorage
const CONFIG_STORAGE_KEY = 'keycloak-tester-config';

// Fonctions de sauvegarde et récupération
export const saveConfigToStorage = (config: MockConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Impossible de sauvegarder la configuration:', error);
  }
};

export const loadConfigFromStorage = (): MockConfig | null => {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Impossible de charger la configuration:', error);
  }
  return null;
};

export const clearConfigFromStorage = (): void => {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (error) {
    console.warn('Impossible d\'effacer la configuration:', error);
  }
};

// Fonctions utilitaires
export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

export const formatTokenExpiration = (exp: number): string => {
  const expirationDate = new Date(exp * 1000);
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Expiré';
  }
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    const remainingMins = diffMins % 60;
    return `Expire dans ${diffDays}j ${remainingHours}h ${remainingMins}m`;
  } else if (diffHours > 0) {
    const remainingMins = diffMins % 60;
    const remainingSecs = diffSecs % 60;
    return `Expire dans ${diffHours}h ${remainingMins}m ${remainingSecs}s`;
  } else if (diffMins > 0) {
    const remainingSecs = diffSecs % 60;
    return `Expire dans ${diffMins}m ${remainingSecs}s`;
  } else {
    return `Expire dans ${diffSecs}s`;
  }
};

// Validation de configuration
export const validateConfig = (config: MockConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.url) {
    errors.push('URL Keycloak est requise');
  }
  if (!config.realm) {
    errors.push('Realm est requis');
  }
  if (!config.clientId) {
    errors.push('Client ID est requis');
  }
  
  return errors;
};

// Simulation de connexion avec sauvegarde automatique
export const simulateConnection = (config: MockConfig): Promise<TokenInfo> => {
  return new Promise((resolve, reject) => {
    const errors = validateConfig(config);
    
    if (errors.length > 0) {
      reject(new Error(errors.join(', ')));
      return;
    }
    
    // Sauvegarder la configuration si la connexion réussit
    saveConfigToStorage(config);
    
    // Simulation d'un délai de connexion
    setTimeout(() => {
      resolve(MOCK_TOKENS);
    }, 1000);
  });
};

// Simulation de rafraîchissement de token
export const simulateTokenRefresh = (currentTokens: TokenInfo): TokenInfo => {
  const newTokens = { ...currentTokens };
  newTokens.tokenParsed.exp = Math.floor(Date.now() / 1000) + 3600; // Nouveau délai d'expiration
  newTokens.idTokenParsed.exp = Math.floor(Date.now() / 1000) + 3600;
  return newTokens;
};