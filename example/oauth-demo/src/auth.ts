import { HttpClient, OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';

export const lichessHost = 'https://lichess.org';
export const scopes = ['board:play'];
export const clientId = 'lichess-oauth-demo';
export const clientUrl = `${location.protocol}//${location.host}/`;

export interface Me {
  id: string;
  username: string;
  httpClient: HttpClient;
  perfs: { [key: string]: any };
}

export class Auth {
  oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes,
    redirectUrl: clientUrl,
    onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
    onInvalidGrant: _retry => {},
  });

  me?: Me;
  error?: string;

  async init() {
    this.error = undefined;
    try {
      const accessContext = await this.oauth.getAccessToken();
      if (accessContext) await this.fetchMe();
    } catch (err) {
      this.error = '' + err;
    }
    if (!this.me) {
      try {
        const hasAuthCode = await this.oauth.isReturningFromAuthServer();
        if (hasAuthCode) await this.fetchMe();
      } catch (err) {
        this.error = '' + err;
      }
    }
  }

  async login() {
    await this.oauth.fetchAuthorizationCode();
  }

  async logout() {
    if (this.me) await this.me.httpClient(`${lichessHost}/api/token`, { method: 'DELETE' });
    localStorage.clear();
    this.error = undefined;
    this.me = undefined;
  }

  fetchResponse = async (path: string, config: any = {}) => {
    const res = await this.me?.httpClient(`${lichessHost}${path}`, config);
    if (res.error || !res.ok) {
      const err = `${res.error} ${res.status} ${res.statusText}`;
      alert(err);
      throw err;
    }
    return res;
  };

  fetchBody = async (path: string, config: any = {}) => {
    const res = await this.fetchResponse(path, config);
    const body = await res.json();
    return body;
  };

  private fetchMe = async () => {
    const fetch = this.oauth.decorateFetchHTTPClient(window.fetch);
    const res = await fetch(`${lichessHost}/api/account`);
    const me = await res.json();
    if (me.error) throw me.error;
    me.httpClient = fetch;
    this.me = me;
    this.error = undefined;
  };
}
