import type { TokenInfo, KeycloakConfig } from '../types';
import { keycloakService } from '../services/keycloakService';

// Key for localStorage
const CONFIG_STORAGE_KEY = 'keycloak-tester-config';

// Default configuration
export const DEFAULT_CONFIG: KeycloakConfig = {
  url: '',
  realm: '',
  clientId: '',
  disableSilentSSO: false,
};

// Function to get initial configuration (from storage or default)
export const getInitialConfig = (): KeycloakConfig => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Unable to load saved configuration:', error);
    }
  }
  return DEFAULT_CONFIG;
};

// Function to save configuration to storage
export const saveConfigToStorage = (config: KeycloakConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Unable to save configuration:', error);
  }
};

// Function to load configuration from storage
export const loadConfigFromStorage = (): KeycloakConfig | null => {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Unable to load configuration:', error);
  }
  return null;
};

// Function to clear configuration from storage
export const clearConfigFromStorage = (): void => {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear configuration:', error);
  }
};

// Function to copy text to clipboard
export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

// Function to format remaining time before token expiration
export const formatTokenExpiration = (exp: number, currentTime?: number): string => {
  const expirationDate = new Date(exp * 1000);
  const now = currentTime ? new Date(currentTime) : new Date();
  const diffMs = expirationDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    const remainingMins = diffMins % 60;
    return `Expires in ${diffDays}d ${remainingHours}h ${remainingMins}m`;
  } else if (diffHours > 0) {
    const remainingMins = diffMins % 60;
    const remainingSecs = diffSecs % 60;
    return `Expires in ${diffHours}h ${remainingMins}m ${remainingSecs}s`;
  } else if (diffMins > 0) {
    const remainingSecs = diffSecs % 60;
    return `Expires in ${diffMins}m ${remainingSecs}s`;
  } else {
    return `Expires in ${diffSecs}s`;
  }
};

// Function to validate configuration
export const validateConfig = (config: KeycloakConfig): string[] => {
  const errors: string[] = [];

  if (!config.url) {
    errors.push('Keycloak URL is required');
  }
  if (!config.realm) {
    errors.push('Realm is required');
  }
  if (!config.clientId) {
    errors.push('Client ID is required');
  }

  return errors;
};

// Function to connect to Keycloak
export const connectToKeycloak = async (
  config: KeycloakConfig,
  disableSilentSSO: boolean = false
): Promise<TokenInfo> => {
  const errors = validateConfig(config);

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  try {
    await keycloakService.initKeycloak(config, disableSilentSSO);

    if (!keycloakService.isAuthenticated()) {
      await keycloakService.login();
      return Promise.reject(new Error('Redirecting to login'));
    }

    // Save configuration if connection succeeds
    const configToSave = { ...config, disableSilentSSO };
    saveConfigToStorage(configToSave);

    const tokenInfo = keycloakService.getTokenInfo();
    if (!tokenInfo) {
      throw new Error('Unable to retrieve tokens');
    }
    return tokenInfo;
  } catch (error) {
    throw new Error(`Keycloak connection error: ${error}`);
  }
};

// Function to check if user is already connected
export const checkExistingAuth = async (
  config: KeycloakConfig,
  disableSilentSSO: boolean = false
): Promise<TokenInfo | null> => {
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
    console.warn('Error checking authentication:', error);
    return null;
  }
};

// Function to disconnect from Keycloak
export const disconnectFromKeycloak = async (): Promise<void> => {
  try {
    await keycloakService.logout();
  } catch (error) {
    console.warn('Error during logout:', error);
  } finally {
    keycloakService.clearKeycloak();
  }
};

// Function to refresh token
export const refreshKeycloakToken = async (): Promise<{ tokenInfo: TokenInfo; message: string }> => {
  try {
    const result = await keycloakService.refreshToken();

    const tokenInfo = keycloakService.getTokenInfo();
    if (!tokenInfo) {
      throw new Error('Unable to retrieve tokens after refresh');
    }

    return { tokenInfo, message: result.message };
  } catch (error) {
    console.error('Detailed refresh error:', error);
    throw new Error(`Error during refresh: ${error instanceof Error ? error.message : error}`);
  }
};
