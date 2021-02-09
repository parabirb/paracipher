/*
    paracipher by parabirb
    public domain
*/

const pkcs = require("pkcs7"); // used for padding
const crypto = require("crypto"); // used for hmac

// xor function for buffers (a should be the smaller buffer for truncation)
function _xor(a, b) {
    // self-documenting
    for (let i = 0; i < a.length; i++) {
        a[i] = a[i] ^ b[i];
    }
    return a;
}

// sha3-256 hmac
function _hmac(p, k) {
    // self-documenting
    const hmac = crypto.createHmac("sha3-256", k);
    hmac.update(p);
    return hmac.digest(); // hmac.digest() always returns buffer if no args are passed
}

/*
    keystream generation:
    1. initialize to hmac(nonce, key)
    2. for each block, set state to hmac(previous state, key) then xor with block
*/

// cipher function (can be used for encryption and decryption)
function _cipher(p, k, n) {
    // set length for loop to the amount of 128-bit blocks
    const len = p.length / 16;
    // set initial state
    let state = _hmac(n, k);
    // init processed blocks
    let processed = [];
    for (let i = 0; i < len; i++) {
        // advance state
        state = _hmac(state, k);
        // set current pos
        let pos = i * 16;
        // find the current block and xor it with the state
        let toprocess = p.slice(pos, pos + 16);
        processed.push(_xor(toprocess, state));
    }
    // return the processed blocks as a buffer
    return Buffer.concat(processed);
}

// decipher
function decipher(p, k) {
    // check if nonce exists
    if (p.length < 32) throw new Error("Nonce is not present.");
    // store nonce from ciphertext and remove the nonce from the ciphertext
    const n = p.slice(0, 32);
    p = p.slice(32);
    // decipher and unpad
    return pkcs.unpad(_cipher(p, k, n));
}

/*
    nonce misuse resistance:
    set nonce to hmac(hmac(nonce, key) + hmac(plaintext, key), key)
*/

// encipher
function encipher(p, k, n) {
    // p can be anything, so convert p to a buffer
    p = Buffer.from(p);
    // nonce misuse resistance: _hmac(_hmac(n, k) + _hmac(p, k), k)
    n = _hmac(Buffer.concat([_hmac(n, k), _hmac(p, k)]), k);
    // pad plaintext, encrypt, then concatenate with nonce
    return Buffer.concat([n, _cipher(pkcs.pad(p), k, n)]);
}

// decipher (authenticated)
function decipherAE(p, k) {
    // verify mac
    if (!p.slice(0, 32).equals(_hmac(p.slice(32), k))) throw new Error(`MAC is ${p.slice(0, 32).toString("hex")} when it should be ${_hmac(p.slice(32), k).toString("hex")}.`);
    // remove mac
    p = p.slice(32);
    // pass ciphertext to decipher(p, k)
    return decipher(p, k);
}

/*
    for AE we can just attach hmac(encipher(plaintext, key, nonce), key) (EtM) to the ciphertext
*/

// encipher (authenticated)
function encipherAE(p, k, n) {
    // encrypt with encipher(p, k, n)
    const enciphered = encipher(p, k, n);
    // concatenate ciphertext with mac
    return Buffer.concat([_hmac(enciphered, k), enciphered]);
}

// exports
module.exports = {
    decipher,
    encipher,
    decipherAE,
    encipherAE
};
