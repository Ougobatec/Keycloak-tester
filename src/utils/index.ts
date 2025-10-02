import type { TokenInfo, KeycloakConfig } from '../types';
import { keycloakService } from '../services/keycloakService';

// Clé pour le localStorage
const CONFIG_STORAGE_KEY = 'keycloak-tester-config';

// Configuration par défaut
export const DEFAULT_CONFIG: KeycloakConfig = {
  url: '',
  realm: '',
  clientId: '',
  disableSilentSSO: false
};

// Fonction pour obtenir la configuration initiale (depuis le storage ou défaut)
export const getInitialConfig = (): KeycloakConfig => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Impossible de charger la configuration sauvegardée:', error);
    }
  }
  return DEFAULT_CONFIG;
};

// Fonction pour sauvegarder la configuration dans le stockage
export const saveConfigToStorage = (config: KeycloakConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Impossible de sauvegarder la configuration:', error);
  }
};

// Fonction pour charger la configuration depuis le stockage
export const loadConfigFromStorage = (): KeycloakConfig | null => {
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

// Fonction pour effacer la configuration du stockage
export const clearConfigFromStorage = (): void => {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (error) {
    console.warn('Impossible d\'effacer la configuration:', error);
  }
};

// Fonction pour copier du texte dans le presse-papiers
export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

// Fonction pour formater le temps restant avant expiration du token
export const formatTokenExpiration = (exp: number, currentTime?: number): string => {
  const expirationDate = new Date(exp * 1000);
  const now = currentTime ? new Date(currentTime) : new Date();
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

// Fonction pour valider la configuration
export const validateConfig = (config: KeycloakConfig): string[] => {
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

// Fonction pour se connecter à Keycloak
export const connectToKeycloak = async (config: KeycloakConfig, disableSilentSSO: boolean = false): Promise<TokenInfo> => {
  const errors = validateConfig(config);
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  try {
    await keycloakService.initKeycloak(config, disableSilentSSO);
    
    if (!keycloakService.isAuthenticated()) {
      await keycloakService.login();
      return Promise.reject(new Error('Redirection vers la connexion'));
    }
    
    // Sauvegarder la configuration si la connexion réussit
    const configToSave = { ...config, disableSilentSSO };
    saveConfigToStorage(configToSave);
    
    const tokenInfo = keycloakService.getTokenInfo();
    if (!tokenInfo) {
      throw new Error('Impossible de récupérer les tokens');
    }
    return tokenInfo;
  } catch (error) {
    throw new Error(`Erreur de connexion Keycloak: ${error}`);
  }
};

// Fonction pour vérifier si l'utilisateur est déjà connecté
export const checkExistingAuth = async (config: KeycloakConfig, disableSilentSSO: boolean = false): Promise<TokenInfo | null> => {
  const errors = validateConfig(config);
  
  if (errors.length > 0) {
    return null;
  }

  try {
    await keycloakService.initKeycloak(config, disableSilentSSO);
    
    if (keycloakService.isAuthenticated()) {
      const tokenInfo = keycloakService.getTokenInfo();
      return tokenInfo;
    }
    
    return null;
  } catch (error) {
    console.warn('Erreur lors de la vérification de l\'authentification:', error);
    return null;
  }
};

// Fonction pour se déconnecter de Keycloak
export const disconnectFromKeycloak = async (): Promise<void> => {
  try {
    await keycloakService.logout();
  } catch (error) {
    console.warn('Erreur lors de la déconnexion:', error);
  } finally {
    keycloakService.clearKeycloak();
  }
};

// Fonction pour rafraîchir le token
export const refreshKeycloakToken = async (): Promise<{ tokenInfo: TokenInfo; message: string }> => {
  try {
    const result = await keycloakService.refreshToken();
    
    const tokenInfo = keycloakService.getTokenInfo();
    if (!tokenInfo) {
      throw new Error('Impossible de récupérer les tokens après rafraîchissement');
    }
    
    return { tokenInfo, message: result.message };
  } catch (error) {
    console.error('Erreur détaillée rafraîchissement:', error);
    throw new Error(`Erreur lors du rafraîchissement: ${error instanceof Error ? error.message : error}`);
  }
};