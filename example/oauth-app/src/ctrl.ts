import { AccessContext, HttpClient, OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';

export const lichessHost = 'https://lichess.org';
export const clientId = 'example.com';
export const clientUrl = (() => {
  const url = new URL(location.href);
  url.search = '';
  return url.href;
})();

export class Ctrl {
  oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes: ['email:read'],
    redirectUrl: clientUrl,
    onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
    onInvalidGrant: _retry => {},
  });

  error?: any;
  accessContext?: AccessContext;

  email?: string;

  constructor(private redraw: () => void) {}

  async init() {
    try {
      const hasAuthCode = await this.oauth.isReturningFromAuthServer();
      if (hasAuthCode) {
        // Might want to persist accessContext.token until the user logs out.
        this.accessContext = await this.oauth.getAccessToken();
        this.redraw();

        // Can also use this convenience wrapper for fetch() instead of
        // using manually using getAccessToken() and setting the
        // "Authorization: Bearer ..." header.
        const fetch = this.oauth.decorateFetchHTTPClient(window.fetch);
        await this.useApi(fetch);
      }
    } catch (err) {
      this.error = err;
      this.redraw();
    }
  }

  async login() {
    await this.oauth.fetchAuthorizationCode();
  }

  async useApi(fetch: HttpClient) {
    // Requests will fail with 401 Unauthorized if the access token expired
    // or was revoked. Make sure to offer a chance to reauthenticate.
    const res = await fetch(`${lichessHost}/api/account/email`);
    this.email = (await res.json()).email;
    this.redraw();
  }

  logout() {
    this.error = undefined;
    this.accessContext = undefined;
    this.redraw();
  }
}
