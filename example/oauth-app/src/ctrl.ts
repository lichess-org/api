import { AccessContext, HttpClient, OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';

export const lichessHost = 'http://localhost:9663';
export const clientId = 'example.com';
export const clientUrl = (() => {
  const url = new URL(location.href);
  url.search = '';
  return url.href;
})();

export class Ctrl {
  oauthClient: OAuth2AuthCodePKCE = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes: ['email:read'],
    redirectUrl: clientUrl,
    onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
    onInvalidGrant: _retry => {},
  });

  error?: any;
  accessToken?: AccessContext;

  email?: string;

  constructor(private redraw: () => void) {}

  async init() {
    try {
      const hasAuthCode = await this.oauthClient.isReturningFromAuthServer();
      if (hasAuthCode) {
        // Might want to persist the token in session storage.
        this.accessToken = await this.oauthClient.getAccessToken();
        this.redraw();

        // Can also use this convenience wrapper for fetch() instead of
        // using the raw token with getAccessToken().
        const fetch = this.oauthClient.decorateFetchHTTPClient(window.fetch);
        await this.useApi(fetch);
      }
    } catch (err) {
      this.error = err;
      this.redraw();
    }
  }

  async login() {
    await this.oauthClient.fetchAuthorizationCode();
  }

  async useApi(fetch: HttpClient) {
    const res = await fetch(`${lichessHost}/api/account/email`);
    this.email = (await res.json()).email;
    this.redraw();
  }

  logout() {
    this.error = undefined;
    this.accessToken = undefined;
    this.redraw();
  }
}
