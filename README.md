# paracipher
**DO NOT USE IN PRODUCTION.** a simple (and optionally authenticated) stream cipher based on SHA3-256.

## how the cipher works
each "block" is 128 bits. the state is initialized with a key and a nonce (at first, it is `hmac(nonce, key)`, where hmac is an hmac based on SHA3-256). for each block, the state is set to `hmac(previous state, key)` and then the block is XORed with the state (truncated to 128 bits).

## how the code works
### detailed description
* `encipher(p: any, k: any, n: any): buffer` enciphers plaintext `p` using key `k` and nonce `n`. in order to add nonce misuse resistance, `n` is set to `hmac(hmac(n, k) + hmac(p, k), k)` where `+` denotes concatenation. it pads `p` with PKCS7 (to a multiple of 16 bytes), then encrypts it with the scheme stated above. the synthesized nonce is also prepended to the ciphertext so it is not required during decryption. returns the ciphertext (including synthesized nonce) as a buffer.
* `decipher(p: buffer, k: any): buffer` deciphers ciphertext `p` using key `k`. it removes and stores the prepended nonce as `n`. it deciphers `p` (without nonce) with the scheme stated above, then unpads the decrypted text with PKCS7. returns the plaintext as a buffer.
* `encipherAE(p: any, k: any, n: any): buffer` serves the same function as `encipher(p, k, n)` but a MAC (32 bytes, `hmac(encipher(p, k, n), k)`) is prepended to the ciphertext. returns the ciphertext (including MAC and nonce) as a buffer.
* `decipherAE(p: buffer, k: any): buffer` serves the same function as `decipher(p, k)` but the MAC is verified and then the ciphertext is decrypted. returns the plaintext as a buffer.
### tl;dr
* `encipher(p: any, k: any, n: any): buffer` encrypts plaintext `p` with key `k` and nonce `n`. returns synthesized nonce and ciphertext as a buffer.
* `decipher(p: buffer, k: any): buffer` decrypts ciphertext `p` with key `k`. returns plaintext as a buffer.
* `encipherAE(p: any, k: any, n: any): buffer` encrypts plaintext `p` with key `k` and nonce `n`. returns MAC, synthesized nonce, and ciphertext as a buffer.
* `decipherAE(p: buffer, k: any): buffer` decrypts ciphertext `p` with key `k`. returns plaintext as a buffer. (it also verifies the MAC mentioned in `encipherAE` before decrypting.)

## ok but why shouldn't i use this in production
* i have no idea if this is secure or not. like, i think it's at least somewhat secure, but that's because i wrote it in the first place.
* this doesn't really have any advantages over any existing stream ciphers? i mean chacha20 is probably faster
* i don't think this is that good? i mean there are better stream ciphers
* i probably made some dumbass design decisions while making this. like the 128-bit "block" thing was a weird design decision i made because i couldn't find a good PKCS7 library.

## usage
an example can be found at test.js. `module.exports` returns an object with `encipher`, `decipher`, `encipherAE`, and `decipherAE`. the AE functions should be used if you would like authenticated encryption, and the non-AE functions can be used if you would like a cipher without authenticated encryption.

## important notes
if you decide to use paracipher, you should know a few things.
* a buffer of at least 32 bytes is recommended for the key (although the key can be any size and even a string).
* nonces can be any size, but ideally they should be at least 32 random bytes or a counter.
* nonces should never be reused. ideally, you would use something like `crypto.randomBytes` or a counter to generate the nonce. however, in the event that a nonce **is** reused, you should be okay if the plaintexts encrypted with that nonce are different (this scheme is nonce-reuse resistant).

## questions or comments
direct them to parabirb on Rizon (IRC), parabirb@protonmail.ch (e-mail), @parabirb (Twitter), or parabirb#9968 (Discord).

## easter egg
decrypt `surprise.mp4.enc` using `decipherAE` with key `"parabirb"` for a surprise.
