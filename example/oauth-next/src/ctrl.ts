export type State = 'unauthorized' | 'preparing' | 'error' | 'verifying' | 'authorized';

const authorizeEndpoint = 'http://localhost:9663/oauth/authorize';

export class Ctrl {
  state: State = 'unauthorized';

  // https://www.oauth.com/oauth2-servers/server-side-apps/possible-errors/
  error: string | null;
  errorDescription: string | null;

  constructor(private redraw: () => void) {
    const params = new URL(location.href).searchParams;
    this.error = params.get('error');
    this.errorDescription = params.get('error_description');
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
    const redirectUri = new URL(location.href);
    redirectUri.search = '';
    const url = new URL(authorizeEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', 'example.com'); // hint only
    url.searchParams.set('redirect_uri', redirectUri.toString());
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('scope', ['email:read'].join(' '));
    location.href = url.href;
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
