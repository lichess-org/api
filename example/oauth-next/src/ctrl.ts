export type State = 'unauthorized' | 'preparing' | 'error' | 'verifying' | 'authorized';

const clientId = 'example.com'; // your domain

const clientUrl = (() => {
  const url = new URL(location.href);
  url.search = '';
  return url.href;
})();

const authorizeEndpoint = 'http://localhost:9663/oauth/authorize';
const tokenEndpoint = 'http://localhost:9663/api/oauth/token';

export class Ctrl {
  state: State = 'unauthorized';

  // https://www.oauth.com/oauth2-servers/server-side-apps/possible-errors/
  error: string | null;
  errorDescription: string | null;

  code: string | null = null;
  accessToken: string | null = null;

  email: string | null = null;

  constructor(private redraw: () => void) {
    const params = new URL(location.href).searchParams;
    this.error = params.get('error');
    this.errorDescription = params.get('error_description');

    if (this.error) this.state == 'error';
    else this.verify(params);
  }

  async login() {
    this.state = 'preparing';
    this.redraw();

    // 1. Generate cryptographically random code verifier.
    const codeVerifier = secureRandom(64);
    sessionStorage.setItem('code_verifier', encodeBase64Url(codeVerifier));

    // 2. Derive code challenge from code verifier.
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', codeVerifier));
    const codeChallenge = encodeBase64Url(digest);

    // 3. Generate random state (arbitrarily).
    const state = encodeBase64Url(secureRandom(64));
    sessionStorage.setItem('state', state);

    // 4. Redirect to authorization endpoint.
    const url = new URL(authorizeEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', clientUrl);
    url.searchParams.set('state', state); // optional
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('scope', ['email:read'].join(' '));
    location.href = url.href;
  }

  async verify(params: URLSearchParams) {
    // 5. Server responded with an authorization code.
    this.code = params.get('code');
    if (!this.code) return;
    this.state = 'verifying';

    // 6. Check state to prevent CSRF.
    const codeVerifier = sessionStorage.getItem('code_verifier');
    const state = params.get('state');
    if (!codeVerifier || !state || state !== sessionStorage.getItem('state')) {
      this.state = 'error';
      this.error = 'invalid_state';
      return;
    }

    // 7. Request access token.
    let res;
    try {
      res = await fetch(tokenEndpoint, {
        'method': 'POST',
        'credentials': 'omit',
        'body': new URLSearchParams({
          'client_id': clientId,
          'code_verifier': codeVerifier,
          'grant_type': 'authorization_code',
          'redirect_url': clientUrl,
          'code': this.code,
        })
      });
    } catch (e) {
      this.state = 'error';
      this.error = 'fetch_error';
      this.errorDescription = e;
      this.redraw();
      return;
    }
    const body = await res.json();
    if (res.status != 200) {
      this.state = 'error';
      this.error = body.error;
      this.errorDescription = body.error_description;
      this.redraw();
      return;
    }

    this.accessToken = body.access_token;
    if (this.accessToken) {
      this.state = 'unauthorized';
      this.redraw();
    }

    return await this.useApi();
  }

  async useApi() {
  }
}

function secureRandom(bytes: number): Uint8Array {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return buffer;
}

function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
