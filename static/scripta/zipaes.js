// Apre nel browser gli zip con password di Verba Manent (WinZip AES-256, AE-2), come app/zip_aes.py.
// Niente librerie: PBKDF2 e HMAC-SHA1 con WebCrypto, AES-256 (solo cifratura, per il CTR) scritto qui,
// il contatore e' little-endian da 1 come vuole il formato; la decompressione con DecompressionStream.
'use strict';
const ZipAes = (() => {
  // ---------------------------------------------------------------- AES-256 (cifratura di un blocco)
  const S = new Uint8Array(256), T0 = new Uint32Array(256), T1 = new Uint32Array(256), T2 = new Uint32Array(256), T3 = new Uint32Array(256);
  (() => {
    const d = new Uint8Array(256), th = new Uint8Array(256);
    for (let i = 0; i < 256; i++) d[i] = i < 128 ? i << 1 : (i << 1) ^ 0x11b;
    let x = 0, xi = 0;
    for (let i = 0; i < 256; i++) {
      let sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
      sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
      S[x] = sx;
      const x2 = d[x], x4 = d[x2], x8 = d[x4];
      let t = (d[sx] * 0x101) ^ (sx * 0x1010100);
      const e = (d[sx] << 24) ^ (sx << 16) ^ (sx << 8) ^ (d[sx] ^ sx);
      T0[x] = e; T1[x] = (e << 24) | (e >>> 8); T2[x] = (e << 16) | (e >>> 16); T3[x] = (e << 8) | (e >>> 24);
      if (x === 0) { x = 1; xi = 1; } else { x = x2 ^ d[d[d[x8 ^ x2]]]; xi ^= d[d[xi]]; }
    }
  })();
  function chiavi(k) {               // k: 32 byte -> 60 parole
    const w = new Uint32Array(60); let rc = 1;
    for (let i = 0; i < 8; i++) w[i] = (k[4 * i] << 24) | (k[4 * i + 1] << 16) | (k[4 * i + 2] << 8) | k[4 * i + 3];
    for (let i = 8; i < 60; i++) {
      let t = w[i - 1];
      if (i % 8 === 0) { t = (S[(t >>> 16) & 255] << 24) | (S[(t >>> 8) & 255] << 16) | (S[t & 255] << 8) | S[t >>> 24]; t ^= rc << 24; rc = rc < 128 ? rc << 1 : (rc << 1) ^ 0x11b; }
      else if (i % 8 === 4) t = (S[t >>> 24] << 24) | (S[(t >>> 16) & 255] << 16) | (S[(t >>> 8) & 255] << 8) | S[t & 255];
      w[i] = w[i - 8] ^ t;
    }
    return w;
  }
  function blocco(w, a, b, c, d, out, o) {   // 4 parole in ingresso, 16 byte in uscita
    a ^= w[0]; b ^= w[1]; c ^= w[2]; d ^= w[3];
    let k = 4;
    for (let r = 1; r < 14; r++) {
      const a2 = T0[a >>> 24] ^ T1[(b >>> 16) & 255] ^ T2[(c >>> 8) & 255] ^ T3[d & 255] ^ w[k];
      const b2 = T0[b >>> 24] ^ T1[(c >>> 16) & 255] ^ T2[(d >>> 8) & 255] ^ T3[a & 255] ^ w[k + 1];
      const c2 = T0[c >>> 24] ^ T1[(d >>> 16) & 255] ^ T2[(a >>> 8) & 255] ^ T3[b & 255] ^ w[k + 2];
      const d2 = T0[d >>> 24] ^ T1[(a >>> 16) & 255] ^ T2[(b >>> 8) & 255] ^ T3[c & 255] ^ w[k + 3];
      a = a2; b = b2; c = c2; d = d2; k += 4;
    }
    const f = (p, q, r2, s, kk) => ((S[p >>> 24] << 24) | (S[(q >>> 16) & 255] << 16) | (S[(r2 >>> 8) & 255] << 8) | S[s & 255]) ^ w[kk];
    const o0 = f(a, b, c, d, k), o1 = f(b, c, d, a, k + 1), o2 = f(c, d, a, b, k + 2), o3 = f(d, a, b, c, k + 3);
    out[o] = o0 >>> 24; out[o + 1] = o0 >>> 16; out[o + 2] = o0 >>> 8; out[o + 3] = o0;
    out[o + 4] = o1 >>> 24; out[o + 5] = o1 >>> 16; out[o + 6] = o1 >>> 8; out[o + 7] = o1;
    out[o + 8] = o2 >>> 24; out[o + 9] = o2 >>> 16; out[o + 10] = o2 >>> 8; out[o + 11] = o2;
    out[o + 12] = o3 >>> 24; out[o + 13] = o3 >>> 16; out[o + 14] = o3 >>> 8; out[o + 15] = o3;
  }
  function aesBlocco(k, p) { const w = chiavi(k), o = new Uint8Array(16), v = i => (p[i] << 24) | (p[i + 1] << 16) | (p[i + 2] << 8) | p[i + 3]; blocco(w, v(0), v(4), v(8), v(12), o, 0); return o; }
  function ctr(k, dati) {            // AES-CTR, contatore little-endian da 1 (WinZip AES)
    const w = chiavi(k), out = new Uint8Array(dati.length), ks = new Uint8Array(16);
    let n = 1;
    for (let i = 0; i < dati.length; i += 16) {
      // contatore in 16 byte little-endian: i primi 4 byte bastano per file fino a 64 GB
      const le = ((n & 255) << 24) | (((n >>> 8) & 255) << 16) | (((n >>> 16) & 255) << 8) | ((n >>> 24) & 255);
      blocco(w, le, 0, 0, 0, ks, 0);
      const m = Math.min(16, dati.length - i);
      for (let j = 0; j < m; j++) out[i + j] = dati[i + j] ^ ks[j];
      n++;
    }
    return out;
  }
  // ---------------------------------------------------------------- zip
  const enc = new TextEncoder(), dec = new TextDecoder();
  class PasswordSbagliata extends Error {}
  async function derivate(password, sale) {
    const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const b = new Uint8Array(await crypto.subtle.deriveBits({name: 'PBKDF2', salt: sale, iterations: 1000, hash: 'SHA-1'}, base, 66 * 8));
    return {kc: b.slice(0, 32), km: b.slice(32, 64), ver: b.slice(64, 66)};
  }
  async function inflate(b) {
    const s = new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  // Torna {nome: Uint8Array}. Solleva PasswordSbagliata se la password non va o lo zip e' rovinato.
  async function apri(buf, password) {
    const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf), v = new DataView(u.buffer, u.byteOffset, u.byteLength);
    let e = u.length - 22;
    while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('non è uno zip');
    const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true);
    const out = {};
    for (let i = 0; i < n; i++) {
      const metodo = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true);
      const ln = v.getUint16(p + 28, true), le = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true), loc = v.getUint32(p + 42, true);
      const nome = dec.decode(u.subarray(p + 46, p + 46 + ln));
      let vero = metodo;                                    // nel campo 0x9901 c'e' il metodo vero (8 = deflate)
      for (let x = p + 46 + ln; x < p + 46 + ln + le;) { const id = v.getUint16(x, true), sz = v.getUint16(x + 2, true); if (id === 0x9901) vero = v.getUint16(x + 9, true); x += 4 + sz; }
      p += 46 + ln + le + lc;
      const ini = loc + 30 + v.getUint16(loc + 26, true) + v.getUint16(loc + 28, true);
      let dati = u.subarray(ini, ini + csize);
      if (metodo === 99) {
        const sale = dati.subarray(0, 16), ver = dati.subarray(16, 18), corpo = dati.subarray(18, dati.length - 10), mac = dati.subarray(dati.length - 10);
        const k = await derivate(password, sale);
        if (k.ver[0] !== ver[0] || k.ver[1] !== ver[1]) throw new PasswordSbagliata(nome);
        const hk = await crypto.subtle.importKey('raw', k.km, {name: 'HMAC', hash: 'SHA-1'}, false, ['sign']);
        const h = new Uint8Array(await crypto.subtle.sign('HMAC', hk, corpo));
        for (let j = 0; j < 10; j++) if (h[j] !== mac[j]) throw new PasswordSbagliata(nome);
        dati = ctr(k.kc, corpo);
      }
      out[nome] = vero === 8 ? await inflate(dati) : dati.slice();
    }
    return out;
  }
  return {apri, aesBlocco, PasswordSbagliata};
})();
if (typeof module !== 'undefined') module.exports = ZipAes;
