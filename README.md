# paracipher
a simple (and optionally authenticated) stream cipher based on SHA3-256. **DO NOT USE IN PRODUCTION.**

## how the cipher works
each "block" is 128 bits. the state is initialized with a key and a nonce (at first, it is `hmac(nonce, key)`, where hmac is an hmac based on SHA3-256). for each block, the state is set to `hmac(previous state, key)` and then the block is XORed with the state (truncated to 128 bits).

## how the code works
* `encipher(p, k, n)` enciphers plaintext `p` using key `k` and nonce `n` (32 bytes). it pads `p` with PKCS7 (to a multiple of 16 bytes), then encrypts it with the scheme stated above. the nonce is also prepended to the ciphertext so it is not required during decryption.
* `decipher(p, k)` deciphers ciphertext `p` using key `k`. it removes and stores the prepended nonce as `n`. it deciphers `p` (without nonce) with the scheme stated above, then unpads the decrypted text with PKCS7.
* `encipherAE(p, k, n)` serves the same function as `encipher(p, k, n)` but a MAC (32 bytes, `hmac(encipher(p, k, n), k)`) is prepended to the ciphertext.
* `decipherAE(p, k)` serves the same function as `decipher(p, k)` but the MAC is verified and then the ciphertext is decrypted.

## usage
an example can be found at test.js. the code is short, so you can figure out how to use it without any assistance.

## questions or comments
direct them to parabirb on Rizon (IRC), parabirb@protonmail.ch (e-mail), @parabirb (Twitter), or parabirb#9968 (Discord).

## easter egg
decrypt `surprise.mp4.enc` using `decipherAE` with key `"parabirb"` for a surprise.
