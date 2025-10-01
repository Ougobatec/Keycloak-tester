import { useState } from 'react';

// Données d'exemple pour l'interface utilisateur
interface MockConfig {
  url: string;
  realm: string;
  clientId: string;
}

interface ParsedToken {
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

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenParsed: ParsedToken;
  idTokenParsed: ParsedToken;
}

// Données mockées
const MOCK_PARSED_TOKEN: ParsedToken = {
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

const MOCK_TOKENS: TokenInfo = {
  accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrYkY3OE9jVFhEWnVpM0VUQkNXRVJvYV9XdU5YZDBvRGdGQ3d5T0JJMmJ3In0.eyJleHAiOjE3Mjc4MTM5MDAsImlhdCI6MTcyNzgxMzYwMCwianRpIjoiMGM3ZmQ1MTUtNzBiOC00MTc2LWE5ZWMtNzY1YjY4ZmVlOWVmIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmV4YW1wbGUuY29tL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibXktY2xpZW50In0.example_signature_here',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Mjc4OTk5MDAsImlhdCI6MTcyNzgxMzYwMCwianRpIjoicmVmcmVzaC10b2tlbi1pZCIsInR5cCI6IlJlZnJlc2gifQ.refresh_signature_here',
  idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrYkY3OE9jVFhEWnVpM0VUQkNXRVJvYV9XdU5YZDBvRGdGQ3d5T0JJMmJ3In0.eyJleHAiOjE3Mjc4MTM5MDAsImlhdCI6MTcyNzgxMzYwMCwianRpIjoiaWQtdG9rZW4taWQiLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20vcmVhbG1zL21hc3RlciIsImF1ZCI6Im15LWNsaWVudCIsInN1YiI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsInR5cCI6IklEIiwiZW1haWwiOiJqZWFuLmR1cG9udEBleGFtcGxlLmNvbSIsIm5hbWUiOiJKZWFuIER1cG9udCIsInByZWZlcnJlZF91c2VybmFtZSI6ImpkdXBvbnQifQ.id_signature_here',
  tokenParsed: MOCK_PARSED_TOKEN,
  idTokenParsed: MOCK_PARSED_TOKEN
};

// Configuration par défaut
const DEFAULT_CONFIG: MockConfig = {
  url: '',
  realm: '',
  clientId: ''
};

function App() {
  const [config, setConfig] = useState<MockConfig>(DEFAULT_CONFIG);
  const [tokens, setTokens] = useState<TokenInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disableSilentSSO, setDisableSilentSSO] = useState(false);
  const [isInitialized] = useState(true);

  const clearSavedConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setDisableSilentSSO(false);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    // Validation des champs
    if (!config.url || !config.realm || !config.clientId) {
      setError('Tous les champs sont requis');
      setIsLoading(false);
      return;
    }
    
    // Simulation d'une connexion
    setTimeout(() => {
      setTokens(MOCK_TOKENS);
      setIsConnected(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    setTokens(null);
    setIsConnected(false);
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRefreshToken = () => {
    // Simulation du rafraîchissement
    if (tokens) {
      const newTokens = { ...tokens };
      newTokens.tokenParsed.exp = Math.floor(Date.now() / 1000) + 3600; // Nouveau délai d'expiration
      setTokens(newTokens);
    }
  };

  const formatTokenExpiration = (exp: number): string => {
    const expirationDate = new Date(exp * 1000);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Expiré';
    }
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `Expire dans ${diffDays} jour(s)`;
    } else if (diffHours > 0) {
      return `Expire dans ${diffHours} heure(s)`;
    } else {
      return `Expire dans ${diffMins} minute(s)`;
    }
  };

  // Affichage de chargement initial
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keycloak Tester</h1>
          <p className="text-gray-600">Testez votre configuration Keycloak et explorez vos tokens</p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Configuration Keycloak
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Keycloak
              </label>
              <input
                type="url"
                value={config.url}
                onChange={(e) => setConfig({...config, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://auth.example.com"
                disabled={isConnected}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Realm
              </label>
              <input
                type="text"
                value={config.realm}
                onChange={(e) => setConfig({...config, realm: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="master"
                disabled={isConnected}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={config.clientId}
                onChange={(e) => setConfig({...config, clientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="my-client"
                disabled={isConnected}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Options avancées</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={disableSilentSSO}
                onChange={(e) => setDisableSilentSSO(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isConnected}
              />
              <span className="text-sm text-gray-600">
                Désactiver le SSO silencieux (résout certains problèmes CSP)
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            {!isConnected ? (
              <>
                <button
                onClick={handleConnect}
                disabled={isLoading || !config.url || !config.realm || !config.clientId}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                )}
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
              
              <button
                onClick={clearSavedConfig}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Effacer la configuration sauvegardée"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Effacer
              </button>
              </>
            ) : (
              <button
                onClick={handleDisconnect}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Se déconnecter
              </button>
            )}
            
            {isConnected && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Connecté</span>
                </div>
                <button
                  onClick={handleRefreshToken}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Rafraîchir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tokens Display */}
        {tokens && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Informations utilisateur
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom</label>
                  <p className="text-gray-900">{tokens.tokenParsed.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{tokens.tokenParsed.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Username</label>
                  <p className="text-gray-900">{tokens.tokenParsed.preferred_username || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{tokens.tokenParsed.sub || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rôles</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tokens.tokenParsed.realm_access?.roles?.map((role: string) => (
                      <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tokens */}
            {['accessToken', 'refreshToken', 'idToken'].map((tokenType) => (
              <div key={tokenType} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                    {tokenType === 'accessToken' ? 'Access Token' : 
                     tokenType === 'refreshToken' ? 'Refresh Token' : 'ID Token'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {(tokenType === 'accessToken' || tokenType === 'idToken') && tokens.tokenParsed.exp && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {formatTokenExpiration(tokens.tokenParsed.exp)}
                      </span>
                    )}
                    <button
                      onClick={() => copyToClipboard(tokens[tokenType as keyof TokenInfo] as string)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copier
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
                  <code className="text-sm text-gray-800 break-all">
                    {tokens[tokenType as keyof TokenInfo] as string}
                  </code>
                </div>
                
                {(tokenType === 'accessToken' || tokenType === 'idToken') && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contenu décodé :</h4>
                    <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-800">
                        {JSON.stringify(
                          tokenType === 'accessToken' ? tokens.tokenParsed : tokens.idTokenParsed, 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;