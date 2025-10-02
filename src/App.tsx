import { useState, useEffect } from 'react';
import type { KeycloakConfig, TokenInfo } from './types';
import {
  copyToClipboard,
  formatTokenExpiration,
  connectToKeycloak,
  disconnectFromKeycloak,
  refreshKeycloakToken,
  checkExistingAuth,
  getInitialConfig,
  saveConfigToStorage,
  clearConfigFromStorage,
  DEFAULT_CONFIG,
} from './utils';

function App() {
  const [config, setConfig] = useState<KeycloakConfig>(DEFAULT_CONFIG);
  const [tokens, setTokens] = useState<TokenInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [disableSilentSSO, setDisableSilentSSO] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Load saved configuration at startup
  useEffect(() => {
    const savedConfig = getInitialConfig();
    setConfig(savedConfig);
    setDisableSilentSSO(savedConfig.disableSilentSSO || false);
  }, []);

  // Check if user is already connected after config loading
  useEffect(() => {
    const checkAuth = async () => {
      if (config.url && config.realm && config.clientId) {
        try {
          const existingTokens = await checkExistingAuth(config, disableSilentSSO);
          if (existingTokens) {
            setTokens(existingTokens);
            setIsConnected(true);
            // Clean URL if necessary
            if (window.location.search.includes('state=') || window.location.hash.includes('state=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        } catch (error) {
          console.warn('Error during automatic check:', error);
        }
      }
    };

    checkAuth();
  }, [config, disableSilentSSO]);

  // Automatically save configuration when it changes
  useEffect(() => {
    if (config.url || config.realm || config.clientId) {
      const configToSave = { ...config, disableSilentSSO };
      saveConfigToStorage(configToSave);
    }
  }, [config, disableSilentSSO]);

  // Timer to update expiration counters every second
  useEffect(() => {
    if (tokens) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tokens]);

  const handleDisableSilentSSOChange = (checked: boolean) => {
    setDisableSilentSSO(checked);
  };

  const clearSavedConfig = () => {
    setConfig(DEFAULT_CONFIG);
    clearConfigFromStorage();
    setDisableSilentSSO(false);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tokenData = await connectToKeycloak(config, disableSilentSSO);
      setTokens(tokenData);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFromKeycloak();
    } catch (err) {
      console.warn('Erreur lors de la déconnexion:', err);
    } finally {
      setTokens(null);
      setIsConnected(false);
      setError(null);
    }
  };

  const handleRefreshToken = async () => {
    if (tokens) {
      try {
        const result = await refreshKeycloakToken();
        setTokens(result.tokenInfo);
        setError(null); // Clear previous errors
        setSuccessMessage(result.message); // Display success message

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);

        console.log(result.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error during refresh');
        setSuccessMessage(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-2">
            <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 16.1667C12.4603 16.1667 12.8334 15.7936 12.8334 15.3333C12.8334 14.8731 12.4603 14.5 12 14.5C11.5398 14.5 11.1667 14.8731 11.1667 15.3333C11.1667 15.7936 11.5398 16.1667 12 16.1667Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.8333 10.3333H6.16667C5.24619 10.3333 4.5 11.0795 4.5 12V18.6666C4.5 19.5871 5.24619 20.3333 6.16667 20.3333H17.8333C18.7538 20.3333 19.5 19.5871 19.5 18.6666V12C19.5 11.0795 18.7538 10.3333 17.8333 10.3333Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.83331 10.3334V7.83335C7.83331 6.72828 8.2723 5.66848 9.0537 4.88708C9.8351 4.10567 10.8949 3.66669 12 3.66669C13.105 3.66669 14.1649 4.10567 14.9463 4.88708C15.7277 5.66848 16.1666 6.72828 16.1666 7.83335V10.3334"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-left">
              <div className="text-2xl font-bold text-primary">Keycloak</div>
              <div className="text-lg text-primary -mt-2">tester</div>
            </div>
          </div>
          <p className="text-gray-600">Test your Keycloak configuration and explore your tokens</p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Keycloak Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keycloak URL</label>
              <input
                type="url"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://auth.example.com"
                disabled={isConnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Realm</label>
              <input
                type="text"
                value={config.realm}
                onChange={(e) => setConfig({ ...config, realm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="master"
                disabled={isConnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input
                type="text"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
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

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Advanced Options</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={disableSilentSSO}
                onChange={(e) => handleDisableSilentSSOChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isConnected}
              />
              <span className="text-sm text-gray-600">Disable silent SSO (resolves some CSP issues)</span>
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  )}
                  {isLoading ? 'Connecting...' : 'Connect'}
                </button>

                <button
                  onClick={clearSavedConfig}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Clear saved configuration"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear
                </button>
              </>
            ) : (
              <button
                onClick={handleDisconnect}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Disconnect
              </button>
            )}

            {isConnected && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <button
                  onClick={handleRefreshToken}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tokens Display */}
        {tokens && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                User Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
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
                  <label className="block text-sm font-medium text-gray-500">Roles</label>
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
              <div key={tokenType} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {tokenType === 'accessToken'
                      ? 'Access Token'
                      : tokenType === 'refreshToken'
                        ? 'Refresh Token'
                        : 'ID Token'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {(tokenType === 'accessToken' || tokenType === 'idToken') && tokens.tokenParsed.exp && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {formatTokenExpiration(tokens.tokenParsed.exp, currentTime)}
                      </span>
                    )}
                    <button
                      onClick={() => copyToClipboard(tokens[tokenType as keyof TokenInfo] as string)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Decoded content:</h4>
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
