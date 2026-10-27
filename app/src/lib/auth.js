export function newSalt() {
  const a = new Uint8Array(12);
  try {
    window.crypto.getRandomValues(a);
  } catch (e) {
    for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
  }
  return Array.prototype.map.call(a, (b) => ('0' + b.toString(16)).slice(-2)).join('');
}

function weakHash(pw, salt) {
  const t = salt + ':' + pw;
  let h1 = 2166136261,
    h2 = 5381;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = (Math.imul(h2, 33) ^ c) | 0;
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

// PBKDF2 via WebCrypto quando disponível; hash simples como reserva (ex.: contexto sem HTTPS).
export async function hashPw(pw, salt) {
  try {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      const enc = new TextEncoder();
      const key = await window.crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      const bits = await window.crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
        key,
        256
      );
      return 'P1:' + Array.prototype.map.call(new Uint8Array(bits), (b) => ('0' + b.toString(16)).slice(-2)).join('');
    }
  } catch (e) {
    /* cai no hash simples abaixo */
  }
  return 'F1:' + weakHash(pw, salt);
}
