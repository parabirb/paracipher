/*
    tests for paracipher
    public domain
*/

const crypto = require("crypto");
const paracipher = require(".");

function pkn() {
    return {
        plaintext: crypto.randomBytes(32),
        key: crypto.randomBytes(32),
        nonce: crypto.randomBytes(32)
    };
}

function decipher_test() {
    let { plaintext, key, nonce } = pkn();
    let enciphered = paracipher.encipherAE(plaintext, key, nonce);
    if (paracipher.decipherAE(enciphered, key).equals(plaintext)) {
        console.log("Decipher test passed.");
        return false;
    }
    else {
        console.log(`Decipher test failed. (Plaintext is ${paracipher.decipherAE(enciphered, key).toString("hex")} when it should be ${plaintext.toString("hex")})`);
        return true;
    }
}

function ae_test() {
    let { plaintext, key, nonce } = pkn();
    let enciphered = Buffer.concat([crypto.randomBytes(32), paracipher.encipherAE(plaintext, key, nonce).slice(32)]);
    try {
        paracipher.decipherAE(enciphered, key);
        console.log("AE test failed.");
        return true;
    }
    catch (e) {
        console.log("AE test passed.");
        return false;
    }
}

let failed = false;
failed = failed || decipher_test();
failed = failed || ae_test();
if (failed) process.exit(1);
