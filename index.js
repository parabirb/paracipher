/*
    paracipher by parabirb
    public domain
*/

const pkcs = require("pkcs7");
const crypto = require("crypto");

function _xor(a, b) {
    for (let i = 0; i < a.length; i++) {
        a[i] = a[i] ^ b[i];
    }
    return a;
}

function _hmac(p, k) {
    const hmac = crypto.createHmac("sha3-256", k);
    hmac.update(p);
    return hmac.digest();
}

function _cipher(p, k, n) {
    const len = p.length / 16;
    let state = _hmac(n, k);
    let processed = [];
    for (let i = 0; i < len; i++) {
        state = _hmac(state, k);
        let pos = i * 16;
        let toprocess = p.slice(pos, pos + 16);
        processed.push(_xor(toprocess, state));
    }
    return Buffer.concat(processed);
}

function decipher(p, k) {
    if (p.length < 32) throw new Error("Nonce is not present.");
    const n = p.slice(0, 32);
    p = p.slice(32);
    return pkcs.unpad(_cipher(p, k, n));
}

function encipher(p, k, n) {
    p = Buffer.from(p);
    n = _hmac(Buffer.concat([Buffer.from(n), p]), k);
    return Buffer.concat([n, _cipher(pkcs.pad(p), k, n)]);
}

function decipherAE(p, k) {
    if (!p.slice(0, 32).equals(_hmac(p.slice(32), k))) throw new Error(`MAC is ${p.slice(0, 32).toString("hex")} when it should be ${_hmac(p.slice(32), k).toString("hex")}.`);
    p = p.slice(32);
    return decipher(p, k);
}

function encipherAE(p, k, n) {
    const enciphered = encipher(p, k, n);
    return Buffer.concat([_hmac(enciphered, k), enciphered]);
}

module.exports = {
    decipher,
    encipher,
    decipherAE,
    encipherAE
};
