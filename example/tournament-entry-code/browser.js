async function hmacSha256(secret, data) {
  const utf8 = new TextEncoder();
  const algorithm = {name: 'HMAC', hash: 'SHA-256'};
  const key = await crypto.subtle.importKey('raw', utf8.encode(secret), algorithm, false, ['sign']);
  return await crypto.subtle.sign(algorithm, key, utf8.encode(data));
}

function hex(buffer) {
  return new Uint8Array(buffer).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '');
}

async function personalTournamentAccessCode(tournamentAccessCode, username) {
  return hex(await hmacSha256(tournamentAccessCode, username.toLowerCase()));
}

personalTournamentAccessCode('secr3t', 'DrNykterstein').then(console.log);
// -> 3ae6cda5610ba80f5510c33ccfd27e0f063e9169a27346fc772087c41422403f
