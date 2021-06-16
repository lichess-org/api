export type State = 'unauthorized' | 'preparing' | 'error' | 'verifying' | 'authorized';

export const clientId = 'example.com';

export const clientUrl = (() => {
  const url = new URL(location.href);
  url.search = '';
  return url.href;
})();

export class Ctrl {
  lichessHost: string;

  state: State;
  accessToken: string | null;

  error?: string | null = null;
  errorDescription?: string | null = null;

  email?: string;

  constructor(private redraw: () => void) {
    this.lichessHost = localStorage.getItem('lichess_host') || 'https://lichess.org';
    this.accessToken = localStorage.getItem('access_token');
    this.state = this.accessToken ? 'authorized' : 'unauthorized';
  }

  setLichessHost(lichessHost: string) {
    if (this.state == 'unauthorized') {
      this.lichessHost = lichessHost;
      localStorage.setItem('lichess_host', this.lichessHost);
    }
  }

  async init() {
    await this.verify();
    await this.useApi();
  }

  async login() {
    this.state = 'preparing';
    this.redraw();

    // Lichess provides OAuth 2 with PKCE flow. The steps below can be
    // performed on a server, but also fully client-side. All clients are
    // considered public, so clients do not have to be registered and there
    // are no client secrets.

    // 1. Generate cryptographically random code verifier (as text).
    const codeVerifier = secureRandom(64);
    sessionStorage.setItem('code_verifier', codeVerifier);

    // 2. Derive code challenge from code verifier.
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier)));
    const codeChallenge = encodeBase64Url(digest);

    // 3. Generate random state (arbitrarily).
    const state = secureRandom(64);
    sessionStorage.setItem('state', state);

    // 4. Redirect to authorization endpoint.
    const url = new URL(`${this.lichessHost}/oauth`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', clientUrl);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('scope', ['email:read'].join(' '));
    location.href = url.href;
  }

  async verify() {
    // 5. Handle errors returned by authorization ...
    const params = new URL(location.href).searchParams;
    this.error = params.get('error');
    this.errorDescription = params.get('error_description');
    if (this.error) {
      this.state == 'error';
      this.redraw();
      return;
    }

    // ... get the code ...
    const code = params.get('code');
    if (!code) return;

    // ... and check the client state to ensure the client really wanted to
    // initiate authentication.
    const codeVerifier = sessionStorage.getItem('code_verifier');
    const storedState = sessionStorage.getItem('state');
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('state');
    if (!codeVerifier || !storedState) return;
    if (params.get('state') !== storedState) {
      this.state = 'error';
      this.error = 'invalid_state';
      this.errorDescription = `!= ${storedState}`;
      this.redraw();
      return;
    }

    // 6. Use the authorization code to request an access token. This should be
    // stored safely, for example in local storage.
    this.state = 'verifying';
    let res;
    try {
      res = await fetch(`${this.lichessHost}/api/token`, {
        method: 'POST',
        credentials: 'omit',
        body: new URLSearchParams({
          client_id: clientId,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: clientUrl,
          code,
        }),
      });
    } catch (e) {
      this.state = 'error';
      this.error = 'fetch_error';
      this.errorDescription = e;
      this.redraw();
      return;
    }

    const body = await res.json();

    if (!res.ok) {
      this.state = 'error';
      this.error = body.error;
      this.errorDescription = body.error_description;
    } else {
      this.state = 'authorized';
      this.accessToken = body.access_token;
      localStorage.setItem('access_token', body.access_token);
    }
    this.redraw();
  }

  async useApi() {
    if (!this.accessToken) return;

    // 7. You can now use the access token to make API requests.
    // Make sure to properly handle errors.
    // Back off for status code 429 Too Many requests, allow
    // reauthenticating for status code 401 Unauthorized (token was revoked
    // or may have expired).
    let res;
    try {
      res = await fetch(`${this.lichessHost}/api/account/email`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (e) {
      this.state = 'error';
      this.error = 'fetch_error';
      this.errorDescription = e;
      this.redraw();
      return;
    }

    if (!res.ok) {
      this.state = 'error';
      this.error = 'api_error';
      this.errorDescription = await res.text();
    } else {
      this.email = (await res.json()).email;
    }
    this.redraw();
  }

  logout() {
    // 8. Logout should really remove the access token from persistent storage.
    this.state = 'unauthorized';
    this.accessToken = null;
    localStorage.removeItem('access_token');

    this.error = undefined;
    this.errorDescription = undefined;

    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('state');

    this.email = undefined;

    this.redraw();
  }
}

function secureRandom(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return encodeBase64Url(buffer);
}

function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
