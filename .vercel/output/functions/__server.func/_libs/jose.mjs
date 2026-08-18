import { $ as validateCrit, At as checkModulusLength, Ct as JWKInvalid, Dt as JWTInvalid, Ft as uint32be, It as uint64be, J as jwsAlgorithm, K as JWTClaimsBuilder, Mt as concat, Nt as decoder, Ot as invalidKeyInput, Pt as encode, Q as validateAlgorithms, St as JWEInvalid, Tt as JWTClaimValidationFailed, X as JWE_RECOGNIZED, Y as sign, Z as JWS_RECOGNIZED, _t as isKeyLike, at as assertNotSet, bt as JOSENotSupported, ct as encodeBase64url, dt as isDisjoint, et as validateCritDuplicates, ft as isJWK, gt as isCryptoKey, ht as assertCryptoKey, it as jwkToKey, jt as checkUsage, kt as checkCryptoKey, lt as parseJoseHeader, mt as encode$1, nt as jweEncryption, ot as decodeBase64url, pt as isObject, q as validateClaimsSet, rt as prepareKey, st as digest, tt as jweAlgorithm, ut as unprotected, vt as isKeyObject, wt as JWSInvalid, xt as JWEDecryptionFailed, yt as JOSEAlgNotAllowed } from "./@better-auth/core+[...].mjs";
//#region node_modules/jose/dist/webapi/lib/content_encryption.js
var generateCek = (enc) => crypto.getRandomValues(new Uint8Array(enc.cekBits >> 3));
function checkCekLength(cek, expected) {
	const actual = cek.byteLength << 3;
	if (actual !== expected) throw new JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
}
var generateIv = (enc) => crypto.getRandomValues(new Uint8Array(enc.ivBits >> 3));
function checkIvLength(enc, iv) {
	if (iv.length << 3 !== enc.ivBits) throw new JWEInvalid("Invalid Initialization Vector length");
}
async function cbcKeySetup(enc, cek, usage) {
	if (!(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "Uint8Array"));
	const keySize = enc.cekBits >> 1;
	return [
		await crypto.subtle.importKey("raw", cek.subarray(keySize >> 3), "AES-CBC", false, [usage]),
		await crypto.subtle.importKey("raw", cek.subarray(0, keySize >> 3), {
			hash: `SHA-${keySize << 1}`,
			name: "HMAC"
		}, false, ["sign"]),
		keySize
	];
}
async function cbcHmacTag(macKey, macData, keySize) {
	return new Uint8Array((await crypto.subtle.sign("HMAC", macKey, macData)).slice(0, keySize >> 3));
}
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
	const [encKey, macKey, keySize] = await cbcKeySetup(enc, cek, "encrypt");
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
		iv,
		name: "AES-CBC"
	}, encKey, plaintext));
	return {
		ciphertext,
		tag: await cbcHmacTag(macKey, concat(aad, iv, ciphertext, uint64be(aad.length * 8)), keySize),
		iv
	};
}
async function timingSafeEqual(a, b) {
	const algorithm = {
		name: "HMAC",
		hash: "SHA-256"
	};
	const key = await crypto.subtle.generateKey(algorithm, false, ["sign", "verify"]);
	const aHmac = await crypto.subtle.sign(algorithm, key, a);
	return crypto.subtle.verify(algorithm, key, aHmac, b);
}
async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
	const [encKey, macKey, keySize] = await cbcKeySetup(enc, cek, "decrypt");
	const expectedTag = await cbcHmacTag(macKey, concat(aad, iv, ciphertext, uint64be(aad.length * 8)), keySize);
	let macCheckPassed;
	try {
		macCheckPassed = await timingSafeEqual(tag, expectedTag);
	} catch {}
	if (!macCheckPassed) throw new JWEDecryptionFailed();
	let plaintext;
	try {
		plaintext = new Uint8Array(await crypto.subtle.decrypt({
			iv,
			name: "AES-CBC"
		}, encKey, ciphertext));
	} catch {}
	if (!plaintext) throw new JWEDecryptionFailed();
	return plaintext;
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
	const encKey = cek instanceof Uint8Array ? await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]) : (checkCryptoKey(cek, enc.subtle, "encrypt"), cek);
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({
		additionalData: aad,
		iv,
		name: "AES-GCM",
		tagLength: 128
	}, encKey, plaintext));
	const tag = encrypted.slice(-16);
	return {
		ciphertext: encrypted.slice(0, -16),
		tag,
		iv
	};
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
	const encKey = cek instanceof Uint8Array ? await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]) : (checkCryptoKey(cek, enc.subtle, "decrypt"), cek);
	try {
		return new Uint8Array(await crypto.subtle.decrypt({
			additionalData: aad,
			iv,
			name: "AES-GCM",
			tagLength: 128
		}, encKey, concat(ciphertext, tag)));
	} catch {
		throw new JWEDecryptionFailed();
	}
}
async function encrypt(enc, plaintext, cek, iv, aad) {
	if (!isCryptoKey(cek) && !(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
	if (iv) checkIvLength(enc, iv);
	else iv = generateIv(enc);
	if (cek instanceof Uint8Array) checkCekLength(cek, enc.cekBits);
	return enc.cbc ? cbcEncrypt(enc, plaintext, cek, iv, aad) : gcmEncrypt(enc, plaintext, cek, iv, aad);
}
async function decrypt(enc, cek, ciphertext, iv, tag, aad) {
	if (!isCryptoKey(cek) && !(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
	if (!iv) throw new JWEInvalid("JWE Initialization Vector missing");
	if (!tag) throw new JWEInvalid("JWE Authentication Tag missing");
	checkIvLength(enc, iv);
	if (cek instanceof Uint8Array) checkCekLength(cek, enc.cekBits);
	return enc.cbc ? cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) : gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/key_management.js
function checkEcdhCryptoKey(key, usage) {
	if (key.algorithm.name !== "ECDH" && key.algorithm.name !== "X25519") throw new TypeError("CryptoKey does not support this operation, its algorithm.name must be ECDH or X25519");
	checkUsage(key, usage);
}
async function aeskwCryptoKey(key, alg, usage) {
	const expected = jweAlgorithm(alg).subtle;
	const cryptoKey = key instanceof Uint8Array ? await crypto.subtle.importKey("raw", key, "AES-KW", true, [usage]) : key;
	checkCryptoKey(cryptoKey, expected, usage);
	return cryptoKey;
}
async function aeskwWrap(alg, key, cek) {
	const cryptoKey = await aeskwCryptoKey(key, alg, "wrapKey");
	const cryptoKeyCek = await crypto.subtle.importKey("raw", cek, {
		hash: "SHA-256",
		name: "HMAC"
	}, true, ["sign"]);
	return new Uint8Array(await crypto.subtle.wrapKey("raw", cryptoKeyCek, cryptoKey, "AES-KW"));
}
async function aeskwUnwrap(alg, key, encryptedKey) {
	const cryptoKey = await aeskwCryptoKey(key, alg, "unwrapKey");
	const cryptoKeyCek = await crypto.subtle.unwrapKey("raw", encryptedKey, cryptoKey, "AES-KW", {
		hash: "SHA-256",
		name: "HMAC"
	}, true, ["sign"]);
	return new Uint8Array(await crypto.subtle.exportKey("raw", cryptoKeyCek));
}
function checkRsaKey(alg, key, usage) {
	checkCryptoKey(key, jweAlgorithm(alg).subtle, usage);
	checkModulusLength(alg, key);
}
function pbes2CryptoKey(key, alg) {
	if (key instanceof Uint8Array) return crypto.subtle.importKey("raw", key, "PBKDF2", false, ["deriveBits"]);
	checkCryptoKey(key, jweAlgorithm(alg).subtle, "deriveBits");
	return key;
}
async function deriveKey(p2s, alg, p2c, key) {
	if (!(p2s instanceof Uint8Array) || p2s.length < 8) throw new JWEInvalid("PBES2 Salt Input must be 8 or more octets");
	if (!Number.isSafeInteger(p2c) || Math.sign(p2c) !== 1) throw new JWEInvalid("PBES2 Count Input must be a positive integer");
	const salt = concat(encode(alg), Uint8Array.of(0), p2s);
	const keylen = parseInt(alg.slice(13, 16), 10);
	const subtleAlg = {
		hash: `SHA-${alg.slice(8, 11)}`,
		iterations: p2c,
		name: "PBKDF2",
		salt
	};
	const cryptoKey = await pbes2CryptoKey(key, alg);
	return new Uint8Array(await crypto.subtle.deriveBits(subtleAlg, cryptoKey, keylen));
}
function lengthAndInput(input) {
	return concat(uint32be(input.length), input);
}
async function concatKdf(Z, L, OtherInfo) {
	const dkLen = L >> 3;
	const hashLen = 32;
	const reps = Math.ceil(dkLen / hashLen);
	const dk = new Uint8Array(reps * hashLen);
	for (let i = 1; i <= reps; i++) {
		const hashResult = await digest("sha256", concat(uint32be(i), Z, OtherInfo));
		dk.set(hashResult, (i - 1) * hashLen);
	}
	return dk.slice(0, dkLen);
}
async function ecdhesDeriveKey(publicKey, privateKey, algorithm, keyLength, apu = /* @__PURE__ */ new Uint8Array(), apv = /* @__PURE__ */ new Uint8Array()) {
	checkEcdhCryptoKey(publicKey);
	checkEcdhCryptoKey(privateKey, "deriveBits");
	const otherInfo = concat(lengthAndInput(encode(algorithm)), lengthAndInput(apu), lengthAndInput(apv), uint32be(keyLength));
	return concatKdf(new Uint8Array(await crypto.subtle.deriveBits({
		name: publicKey.algorithm.name,
		public: publicKey
	}, privateKey, publicKey.algorithm.name === "X25519" ? 256 : Math.ceil(parseInt(publicKey.algorithm.namedCurve.slice(-3), 10) / 8) << 3)), keyLength, otherInfo);
}
function assertEcdhKey(key) {
	assertCryptoKey(key);
	const curve = key.algorithm.namedCurve;
	if (curve !== "P-256" && curve !== "P-384" && curve !== "P-521" && key.algorithm.name !== "X25519") throw new JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
}
function assertEncryptedKey(encryptedKey) {
	if (encryptedKey === void 0) throw new JWEInvalid("JWE Encrypted Key missing");
}
function assertNoEncryptedKey(encryptedKey) {
	if (encryptedKey !== void 0) throw new JWEInvalid("Encountered unexpected JWE Encrypted Key");
}
async function decryptKeyManagement(alg, enc, key, encryptedKey, joseHeader, options) {
	const entry = jweAlgorithm(alg);
	if (alg === "dir") {
		assertNoEncryptedKey(encryptedKey);
		return key;
	}
	switch (entry.subtle.name) {
		case "ECDH": {
			if (alg === "ECDH-ES") assertNoEncryptedKey(encryptedKey);
			if (!isObject(joseHeader.epk)) throw new JWEInvalid(`JOSE Header "epk" (Ephemeral Public Key) missing or invalid`);
			assertEcdhKey(key);
			const epk = await jwkToKey(entry, joseHeader.epk);
			let partyUInfo;
			let partyVInfo;
			if (joseHeader.apu !== void 0) {
				if (typeof joseHeader.apu !== "string") throw new JWEInvalid(`JOSE Header "apu" (Agreement PartyUInfo) invalid`);
				partyUInfo = decodeBase64url(joseHeader.apu, "apu", JWEInvalid);
			}
			if (joseHeader.apv !== void 0) {
				if (typeof joseHeader.apv !== "string") throw new JWEInvalid(`JOSE Header "apv" (Agreement PartyVInfo) invalid`);
				partyVInfo = decodeBase64url(joseHeader.apv, "apv", JWEInvalid);
			}
			const sharedSecret = await ecdhesDeriveKey(epk, key, alg === "ECDH-ES" ? enc.alg : alg, alg === "ECDH-ES" ? enc.cekBits : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
			if (alg === "ECDH-ES") return sharedSecret;
			assertEncryptedKey(encryptedKey);
			return aeskwUnwrap(alg.slice(-6), sharedSecret, encryptedKey);
		}
		case "RSA-OAEP":
			assertEncryptedKey(encryptedKey);
			assertCryptoKey(key);
			checkRsaKey(alg, key, "decrypt");
			return new Uint8Array(await crypto.subtle.decrypt("RSA-OAEP", key, encryptedKey));
		case "PBKDF2": {
			assertEncryptedKey(encryptedKey);
			if (typeof joseHeader.p2c !== "number") throw new JWEInvalid(`JOSE Header "p2c" (PBES2 Count) missing or invalid`);
			const p2cLimit = options?.maxPBES2Count || 1e4;
			if (joseHeader.p2c > p2cLimit) throw new JWEInvalid(`JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds`);
			if (typeof joseHeader.p2s !== "string") throw new JWEInvalid(`JOSE Header "p2s" (PBES2 Salt) missing or invalid`);
			const derived = await deriveKey(decodeBase64url(joseHeader.p2s, "p2s", JWEInvalid), alg, joseHeader.p2c, key);
			return aeskwUnwrap(alg.slice(-6), derived, encryptedKey);
		}
		case "AES-KW":
			assertEncryptedKey(encryptedKey);
			return aeskwUnwrap(alg, key, encryptedKey);
		case "AES-GCM": {
			assertEncryptedKey(encryptedKey);
			if (typeof joseHeader.iv !== "string") throw new JWEInvalid(`JOSE Header "iv" (Initialization Vector) missing or invalid`);
			if (typeof joseHeader.tag !== "string") throw new JWEInvalid(`JOSE Header "tag" (Authentication Tag) missing or invalid`);
			let iv;
			iv = decodeBase64url(joseHeader.iv, "iv", JWEInvalid);
			let tag;
			tag = decodeBase64url(joseHeader.tag, "tag", JWEInvalid);
			return decrypt(jweEncryption(alg.slice(0, -2)), key, encryptedKey, iv, tag, /* @__PURE__ */ new Uint8Array());
		}
	}
}
async function encryptKeyManagement(alg, enc, key, providedCek, providedParameters = {}) {
	let encryptedKey;
	let parameters;
	let cek;
	const entry = jweAlgorithm(alg);
	if (alg === "dir") return [
		key,
		void 0,
		void 0
	];
	switch (entry.subtle.name) {
		case "ECDH": {
			assertEcdhKey(key);
			const { apu, apv } = providedParameters;
			let ephemeralKey;
			if (providedParameters.epk) ephemeralKey = await prepareKey(entry, providedParameters.epk, "decrypt");
			else ephemeralKey = (await crypto.subtle.generateKey(key.algorithm, true, ["deriveBits"])).privateKey;
			const subtle = crypto.subtle;
			let exportableEpk = ephemeralKey;
			if (!exportableEpk.extractable) {
				if (typeof subtle.getPublicKey !== "function") throw new TypeError("CryptoKey for \"epk\" must be extractable");
				exportableEpk = await subtle.getPublicKey(ephemeralKey, []);
			}
			const { x, y, crv, kty } = await subtle.exportKey("jwk", exportableEpk);
			const sharedSecret = await ecdhesDeriveKey(key, ephemeralKey, alg === "ECDH-ES" ? enc.alg : alg, alg === "ECDH-ES" ? enc.cekBits : parseInt(alg.slice(-5, -2), 10), apu, apv);
			parameters = { epk: {
				x,
				crv,
				kty
			} };
			if (kty === "EC") parameters.epk.y = y;
			if (apu) parameters.apu = encode$1(apu);
			if (apv) parameters.apv = encode$1(apv);
			if (alg === "ECDH-ES") {
				cek = sharedSecret;
				break;
			}
			cek = providedCek || generateCek(enc);
			encryptedKey = await aeskwWrap(alg.slice(-6), sharedSecret, cek);
			break;
		}
		case "RSA-OAEP":
			cek = providedCek || generateCek(enc);
			assertCryptoKey(key);
			checkRsaKey(alg, key, "encrypt");
			encryptedKey = new Uint8Array(await crypto.subtle.encrypt("RSA-OAEP", key, cek));
			break;
		case "PBKDF2": {
			cek = providedCek || generateCek(enc);
			const { p2c = 2048, p2s = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16)) } = providedParameters;
			const derived = await deriveKey(p2s, alg, p2c, key);
			encryptedKey = await aeskwWrap(alg.slice(-6), derived, cek);
			parameters = {
				p2c,
				p2s: encode$1(p2s)
			};
			break;
		}
		case "AES-KW":
			cek = providedCek || generateCek(enc);
			encryptedKey = await aeskwWrap(alg, key, cek);
			break;
		case "AES-GCM": {
			cek = providedCek || generateCek(enc);
			const { iv } = providedParameters;
			const wrapped = await encrypt(jweEncryption(alg.slice(0, -2)), cek, key, iv, /* @__PURE__ */ new Uint8Array());
			encryptedKey = wrapped.ciphertext;
			parameters = {
				iv: encode$1(wrapped.iv),
				tag: encode$1(wrapped.tag)
			};
			break;
		}
	}
	return [
		cek,
		encryptedKey,
		parameters
	];
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/deflate.js
function supported(name) {
	if (typeof globalThis[name] === "undefined") throw new JOSENotSupported(`JWE "zip" (Compression Algorithm) Header Parameter requires the ${name} API.`);
}
async function compress(input) {
	supported("CompressionStream");
	const cs = new CompressionStream("deflate-raw");
	const writer = cs.writable.getWriter();
	writer.write(input).catch(() => {});
	writer.close().catch(() => {});
	const chunks = [];
	const reader = cs.readable.getReader();
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		chunks.push(value);
	}
	return concat(...chunks);
}
async function decompress(input, maxLength) {
	supported("DecompressionStream");
	const ds = new DecompressionStream("deflate-raw");
	const writer = ds.writable.getWriter();
	writer.write(input).catch(() => {});
	writer.close().catch(() => {});
	const chunks = [];
	let length = 0;
	const reader = ds.readable.getReader();
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		chunks.push(value);
		length += value.byteLength;
		if (maxLength !== Infinity && length > maxLength) throw new JWEInvalid("Decompressed plaintext exceeded the configured limit");
	}
	return concat(...chunks);
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/jwe_decrypt.js
function shareJWE(jwe) {
	const { protected: encodedProtected, ciphertext, iv, tag, aad } = jwe;
	let parsedProt;
	if (encodedProtected) parsedProt = parseJoseHeader(encodedProtected, JWEInvalid, "JWE Protected Header is invalid");
	const protectedHeader = encodedProtected !== void 0 ? encode(encodedProtected) : /* @__PURE__ */ new Uint8Array();
	return [
		parsedProt,
		decodeBase64url(ciphertext, "ciphertext", JWEInvalid),
		iv !== void 0 ? decodeBase64url(iv, "iv", JWEInvalid) : void 0,
		tag !== void 0 ? decodeBase64url(tag, "tag", JWEInvalid) : void 0,
		aad !== void 0 ? concat(protectedHeader, encode("."), encodeBase64url(aad, "aad", JWEInvalid)) : protectedHeader
	];
}
function prepareDecrypt(options) {
	return [
		options && validateAlgorithms("keyManagementAlgorithms", options.keyManagementAlgorithms),
		options && validateAlgorithms("contentEncryptionAlgorithms", options.contentEncryptionAlgorithms),
		options
	];
}
async function decryptRecipient(jwe, token, shared, key) {
	const [keyManagementAlgorithms, contentEncryptionAlgorithms, options] = shared;
	const [parsedProt, ciphertext, iv, tag, additionalData] = token;
	const { encrypted_key: encodedKey, header, unprotected } = jwe;
	let joseHeader;
	if (header !== void 0 || unprotected !== void 0) {
		if (!isDisjoint(parsedProt, header, unprotected)) throw new JWEInvalid("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
		joseHeader = {
			...parsedProt,
			...header,
			...unprotected
		};
	} else joseHeader = parsedProt ?? {};
	validateCrit(JWEInvalid, JWE_RECOGNIZED, options?.crit, parsedProt, joseHeader);
	if (joseHeader.zip !== void 0 && joseHeader.zip !== "DEF") throw new JOSENotSupported("Unsupported JWE \"zip\" (Compression Algorithm) Header Parameter value.");
	if (joseHeader.zip !== void 0 && !parsedProt?.zip) throw new JWEInvalid("JWE \"zip\" (Compression Algorithm) Header Parameter MUST be in a protected header.");
	const { alg, enc } = joseHeader;
	if (typeof alg !== "string" || !alg) throw new JWEInvalid("missing JWE Algorithm (alg) in JWE Header");
	if (typeof enc !== "string" || !enc) throw new JWEInvalid("missing JWE Encryption Algorithm (enc) in JWE Header");
	if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg) || !keyManagementAlgorithms && alg.startsWith("PBES2")) throw new JOSEAlgNotAllowed("\"alg\" (Algorithm) Header Parameter value not allowed");
	if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) throw new JOSEAlgNotAllowed("\"enc\" (Encryption Algorithm) Header Parameter value not allowed");
	const encEntry = jweEncryption(enc);
	let encryptedKey;
	if (encodedKey !== void 0) encryptedKey = decodeBase64url(encodedKey, "encrypted_key", JWEInvalid);
	let resolvedKey = false;
	if (typeof key === "function") {
		key = await key(parsedProt, jwe);
		resolvedKey = true;
	}
	const algEntry = jweAlgorithm(alg);
	const k = await prepareKey(alg === "dir" ? encEntry : algEntry, key, "decrypt");
	let cek;
	try {
		cek = await decryptKeyManagement(alg, encEntry, k, encryptedKey, joseHeader, options);
	} catch (err) {
		if (err instanceof TypeError || err instanceof JWEInvalid || err instanceof JOSENotSupported) throw err;
		cek = generateCek(encEntry);
	}
	let plaintext = await decrypt(encEntry, cek, ciphertext, iv, tag, additionalData);
	if (joseHeader.zip === "DEF") {
		const maxDecompressedLength = options?.maxDecompressedLength ?? 25e4;
		if (maxDecompressedLength === 0) throw new JOSENotSupported("JWE \"zip\" (Compression Algorithm) Header Parameter is not supported.");
		if (maxDecompressedLength !== Infinity && (!Number.isSafeInteger(maxDecompressedLength) || maxDecompressedLength < 1)) throw new TypeError("maxDecompressedLength must be 0, a positive safe integer, or Infinity");
		plaintext = await decompress(plaintext, maxDecompressedLength).catch((cause) => {
			if (cause instanceof JWEInvalid) throw cause;
			throw new JWEInvalid("Failed to decompress plaintext", { cause });
		});
	}
	return [
		plaintext,
		parsedProt,
		k,
		resolvedKey
	];
}
async function decryptJWE(jwe, shared, key) {
	return decryptRecipient(jwe, shareJWE(jwe), shared, key);
}
async function decryptCompact(jwe, shared, key) {
	if (jwe instanceof Uint8Array) jwe = decoder.decode(jwe);
	if (typeof jwe !== "string") throw new JWEInvalid("Compact JWE must be a string or Uint8Array");
	const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split(".");
	if (length !== 5) throw new JWEInvalid("Invalid Compact JWE");
	return decryptJWE({
		ciphertext,
		iv: iv || void 0,
		protected: protectedHeader,
		tag: tag || void 0,
		encrypted_key: encryptedKey || void 0
	}, shared, key);
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/jwe_encrypt.js
function checkDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader) {
	if (!isDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader)) throw new JWEInvalid("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
}
function checkEncryptHeaders(input) {
	const [, protectedHeader, unprotectedHeader, sharedUnprotectedHeader, , , , , crit] = input;
	checkDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader);
	const joseHeader = {
		...protectedHeader,
		...unprotectedHeader,
		...sharedUnprotectedHeader
	};
	validateCrit(JWEInvalid, JWE_RECOGNIZED, crit, protectedHeader, joseHeader);
	if (joseHeader.zip !== void 0 && joseHeader.zip !== "DEF") throw new JOSENotSupported("Unsupported JWE \"zip\" (Compression Algorithm) Header Parameter value.");
	if (joseHeader.zip !== void 0 && !protectedHeader?.zip) throw new JWEInvalid("JWE \"zip\" (Compression Algorithm) Header Parameter MUST be in a protected header.");
	const { alg, enc } = joseHeader;
	if (typeof alg !== "string" || !alg) throw new JWEInvalid("JWE \"alg\" (Algorithm) Header Parameter missing or invalid");
	if (typeof enc !== "string" || !enc) throw new JWEInvalid("JWE \"enc\" (Encryption Algorithm) Header Parameter missing or invalid");
	return [
		joseHeader,
		alg,
		enc,
		jweEncryption(enc)
	];
}
async function encryptJWE(input, checked, key) {
	const [joseHeader, alg, , encEntry] = checked;
	const [inputPlaintext, inputProtectedHeader, inputUnprotectedHeader, sharedUnprotectedHeader, aad, providedCek, inputIv, keyManagementParameters, , unprotectedParameters] = input;
	let protectedHeader = inputProtectedHeader;
	let unprotectedHeader = inputUnprotectedHeader;
	if (providedCek && (alg === "dir" || alg === "ECDH-ES")) throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${alg}`);
	const algEntry = jweAlgorithm(alg);
	const [cek, encryptedKey, parameters] = await encryptKeyManagement(alg, encEntry, await prepareKey(alg === "dir" ? encEntry : algEntry, key, "encrypt"), providedCek, keyManagementParameters);
	if (parameters) {
		if (unprotectedParameters) unprotectedHeader = unprotectedHeader ? {
			...unprotectedHeader,
			...parameters
		} : parameters;
		else protectedHeader = protectedHeader ? {
			...protectedHeader,
			...parameters
		} : parameters;
		checkDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader);
	}
	let protectedHeaderS;
	let protectedHeaderB;
	if (protectedHeader) {
		protectedHeaderS = encode$1(JSON.stringify(protectedHeader));
		protectedHeaderB = encode(protectedHeaderS);
	} else {
		protectedHeaderS = "";
		protectedHeaderB = /* @__PURE__ */ new Uint8Array();
	}
	let additionalData;
	let aadMember;
	if (aad?.byteLength) {
		aadMember = encode$1(aad);
		additionalData = concat(protectedHeaderB, encode("."), encode(aadMember));
	} else additionalData = protectedHeaderB;
	let plaintext = inputPlaintext;
	if (joseHeader.zip === "DEF") plaintext = await compress(plaintext).catch((cause) => {
		throw new JWEInvalid("Failed to compress plaintext", { cause });
	});
	const { ciphertext, tag, iv } = await encrypt(encEntry, plaintext, cek, inputIv, additionalData);
	const jwe = { ciphertext: encode$1(ciphertext) };
	if (iv) jwe.iv = encode$1(iv);
	if (tag) jwe.tag = encode$1(tag);
	if (encryptedKey) jwe.encrypted_key = encode$1(encryptedKey);
	if (aadMember) jwe.aad = aadMember;
	if (protectedHeader) jwe.protected = protectedHeaderS;
	if (sharedUnprotectedHeader) jwe.unprotected = sharedUnprotectedHeader;
	if (unprotectedHeader) jwe.header = unprotectedHeader;
	return jwe;
}
async function createJWE(input, key) {
	return encryptJWE(input, checkEncryptHeaders(input), key);
}
//#endregion
//#region node_modules/jose/dist/webapi/jwe/flattened/encrypt.js
var FlattenedEncrypt = class {
	#plaintext;
	#protectedHeader;
	#sharedUnprotectedHeader;
	#unprotectedHeader;
	#aad;
	#cek;
	#iv;
	#keyManagementParameters;
	constructor(plaintext) {
		if (!(plaintext instanceof Uint8Array)) throw new TypeError("plaintext must be an instance of Uint8Array");
		this.#plaintext = plaintext;
	}
	setKeyManagementParameters(parameters) {
		assertNotSet(this.#keyManagementParameters, "setKeyManagementParameters");
		this.#keyManagementParameters = parameters;
		return this;
	}
	setProtectedHeader(protectedHeader) {
		assertNotSet(this.#protectedHeader, "setProtectedHeader");
		this.#protectedHeader = protectedHeader;
		return this;
	}
	setSharedUnprotectedHeader(sharedUnprotectedHeader) {
		assertNotSet(this.#sharedUnprotectedHeader, "setSharedUnprotectedHeader");
		this.#sharedUnprotectedHeader = sharedUnprotectedHeader;
		return this;
	}
	setUnprotectedHeader(unprotectedHeader) {
		assertNotSet(this.#unprotectedHeader, "setUnprotectedHeader");
		this.#unprotectedHeader = unprotectedHeader;
		return this;
	}
	setAdditionalAuthenticatedData(aad) {
		this.#aad = aad;
		return this;
	}
	setContentEncryptionKey(cek) {
		assertNotSet(this.#cek, "setContentEncryptionKey");
		this.#cek = cek;
		return this;
	}
	setInitializationVector(iv) {
		assertNotSet(this.#iv, "setInitializationVector");
		this.#iv = iv;
		return this;
	}
	async encrypt(key, options) {
		if (!this.#protectedHeader && !this.#unprotectedHeader && !this.#sharedUnprotectedHeader) throw new JWEInvalid("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
		validateCritDuplicates(JWEInvalid, this.#protectedHeader);
		return createJWE([
			this.#plaintext,
			this.#protectedHeader,
			this.#unprotectedHeader,
			this.#sharedUnprotectedHeader,
			this.#aad,
			this.#cek,
			this.#iv,
			this.#keyManagementParameters,
			options?.crit,
			options ? unprotected in options : false
		], key);
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwt/decrypt.js
async function jwtDecrypt(jwt, key, options) {
	const decrypted = await decryptCompact(jwt, prepareDecrypt(options), key);
	const protectedHeader = decrypted[1];
	const payload = validateClaimsSet(protectedHeader, decrypted[0], options);
	if (protectedHeader.iss !== void 0 && protectedHeader.iss !== payload.iss) throw new JWTClaimValidationFailed("replicated \"iss\" claim header parameter mismatch", payload, "iss", "mismatch");
	if (protectedHeader.sub !== void 0 && protectedHeader.sub !== payload.sub) throw new JWTClaimValidationFailed("replicated \"sub\" claim header parameter mismatch", payload, "sub", "mismatch");
	if (protectedHeader.aud !== void 0 && JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) throw new JWTClaimValidationFailed("replicated \"aud\" claim header parameter mismatch", payload, "aud", "mismatch");
	const result = {
		payload,
		protectedHeader
	};
	if (typeof key === "function") return {
		...result,
		key: decrypted[2]
	};
	return result;
}
//#endregion
//#region node_modules/jose/dist/webapi/jwe/compact/encrypt.js
var CompactEncrypt = class {
	#flattened;
	constructor(plaintext) {
		this.#flattened = new FlattenedEncrypt(plaintext);
	}
	setContentEncryptionKey(cek) {
		this.#flattened.setContentEncryptionKey(cek);
		return this;
	}
	setInitializationVector(iv) {
		this.#flattened.setInitializationVector(iv);
		return this;
	}
	setProtectedHeader(protectedHeader) {
		this.#flattened.setProtectedHeader(protectedHeader);
		return this;
	}
	setKeyManagementParameters(parameters) {
		this.#flattened.setKeyManagementParameters(parameters);
		return this;
	}
	async encrypt(key, options) {
		const jwe = await this.#flattened.encrypt(key, options);
		return [
			jwe.protected,
			jwe.encrypted_key,
			jwe.iv,
			jwe.ciphertext,
			jwe.tag
		].join(".");
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/lib/jws_sign.js
function unencodedPayload(protectedHeader) {
	return protectedHeader?.b64 === false && Array.isArray(protectedHeader.crit) && protectedHeader.crit.includes("b64");
}
async function createSignature(input, key) {
	const { protectedHeader, unprotectedHeader } = input;
	if (!protectedHeader && !unprotectedHeader) throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
	if (!isDisjoint(protectedHeader, unprotectedHeader)) throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
	const joseHeader = {
		...protectedHeader,
		...unprotectedHeader
	};
	validateCritDuplicates(JWSInvalid, protectedHeader);
	const extensions = validateCrit(JWSInvalid, JWS_RECOGNIZED, input.crit, protectedHeader, joseHeader);
	let b64 = true;
	if (extensions.includes("b64")) {
		b64 = protectedHeader.b64;
		if (typeof b64 !== "boolean") throw new JWSInvalid("The \"b64\" (base64url-encode payload) Header Parameter must be a boolean");
	}
	const { alg } = joseHeader;
	if (typeof alg !== "string" || !alg) throw new JWSInvalid("JWS \"alg\" (Algorithm) Header Parameter missing or invalid");
	const entry = jwsAlgorithm(alg);
	let payloadS;
	let payloadB;
	if (b64) {
		const encoded = input.encoded ??= [];
		encoded[0] ??= encode$1(input.payload);
		encoded[1] ??= encode(encoded[0]);
		payloadS = encoded[0];
		payloadB = encoded[1];
	} else {
		payloadB = input.payload;
		payloadS = "";
	}
	let protectedHeaderString;
	let protectedHeaderBytes;
	if (protectedHeader) {
		protectedHeaderString = encode$1(JSON.stringify(protectedHeader));
		protectedHeaderBytes = encode(protectedHeaderString);
	} else {
		protectedHeaderString = "";
		protectedHeaderBytes = /* @__PURE__ */ new Uint8Array();
	}
	const data = concat(protectedHeaderBytes, encode("."), payloadB);
	const k = await prepareKey(entry, key, "sign");
	const signature = await sign(entry, k, data);
	const jws = {
		signature: encode$1(signature),
		payload: payloadS
	};
	if (protectedHeader) jws.protected = protectedHeaderString;
	if (unprotectedHeader) jws.header = unprotectedHeader;
	return jws;
}
//#endregion
//#region node_modules/jose/dist/webapi/jws/flattened/sign.js
var FlattenedSign = class {
	#payload;
	#protectedHeader;
	#unprotectedHeader;
	constructor(payload) {
		if (!(payload instanceof Uint8Array)) throw new TypeError("payload must be an instance of Uint8Array");
		this.#payload = payload;
	}
	setProtectedHeader(protectedHeader) {
		assertNotSet(this.#protectedHeader, "setProtectedHeader");
		this.#protectedHeader = protectedHeader;
		return this;
	}
	setUnprotectedHeader(unprotectedHeader) {
		assertNotSet(this.#unprotectedHeader, "setUnprotectedHeader");
		this.#unprotectedHeader = unprotectedHeader;
		return this;
	}
	async sign(key, options) {
		return createSignature({
			payload: this.#payload,
			protectedHeader: this.#protectedHeader,
			unprotectedHeader: this.#unprotectedHeader,
			crit: options?.crit
		}, key);
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jws/compact/sign.js
var CompactSign = class {
	#flattened;
	#protectedHeader;
	constructor(payload) {
		this.#flattened = new FlattenedSign(payload);
	}
	setProtectedHeader(protectedHeader) {
		this.#flattened.setProtectedHeader(protectedHeader);
		this.#protectedHeader = protectedHeader;
		return this;
	}
	async sign(key, options) {
		if (unencodedPayload(this.#protectedHeader)) throw new TypeError("use the flattened module for creating JWS with b64: false");
		const jws = await this.#flattened.sign(key, options);
		return `${jws.protected}.${jws.payload}.${jws.signature}`;
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT = class {
	#protectedHeader;
	#jwt;
	constructor(payload = {}) {
		this.#jwt = new JWTClaimsBuilder(payload);
	}
	setIssuer(issuer) {
		this.#jwt.iss = issuer;
		return this;
	}
	setSubject(subject) {
		this.#jwt.sub = subject;
		return this;
	}
	setAudience(audience) {
		this.#jwt.aud = audience;
		return this;
	}
	setJti(jwtId) {
		this.#jwt.jti = jwtId;
		return this;
	}
	setNotBefore(input) {
		this.#jwt.nbf = input;
		return this;
	}
	setExpirationTime(input) {
		this.#jwt.exp = input;
		return this;
	}
	setIssuedAt(input) {
		this.#jwt.iat = input;
		return this;
	}
	setProtectedHeader(protectedHeader) {
		this.#protectedHeader = protectedHeader;
		return this;
	}
	async sign(key, options) {
		const sig = new CompactSign(this.#jwt.data());
		sig.setProtectedHeader(this.#protectedHeader);
		if (unencodedPayload(this.#protectedHeader)) throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
		return sig.sign(key, options);
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwt/encrypt.js
var EncryptJWT = class {
	#cek;
	#iv;
	#keyManagementParameters;
	#protectedHeader;
	#replicateIssuerAsHeader;
	#replicateSubjectAsHeader;
	#replicateAudienceAsHeader;
	#jwt;
	constructor(payload = {}) {
		this.#jwt = new JWTClaimsBuilder(payload);
	}
	setIssuer(issuer) {
		this.#jwt.iss = issuer;
		return this;
	}
	setSubject(subject) {
		this.#jwt.sub = subject;
		return this;
	}
	setAudience(audience) {
		this.#jwt.aud = audience;
		return this;
	}
	setJti(jwtId) {
		this.#jwt.jti = jwtId;
		return this;
	}
	setNotBefore(input) {
		this.#jwt.nbf = input;
		return this;
	}
	setExpirationTime(input) {
		this.#jwt.exp = input;
		return this;
	}
	setIssuedAt(input) {
		this.#jwt.iat = input;
		return this;
	}
	setProtectedHeader(protectedHeader) {
		assertNotSet(this.#protectedHeader, "setProtectedHeader");
		this.#protectedHeader = protectedHeader;
		return this;
	}
	setKeyManagementParameters(parameters) {
		assertNotSet(this.#keyManagementParameters, "setKeyManagementParameters");
		this.#keyManagementParameters = parameters;
		return this;
	}
	setContentEncryptionKey(cek) {
		assertNotSet(this.#cek, "setContentEncryptionKey");
		this.#cek = cek;
		return this;
	}
	setInitializationVector(iv) {
		assertNotSet(this.#iv, "setInitializationVector");
		this.#iv = iv;
		return this;
	}
	replicateIssuerAsHeader() {
		this.#replicateIssuerAsHeader = true;
		return this;
	}
	replicateSubjectAsHeader() {
		this.#replicateSubjectAsHeader = true;
		return this;
	}
	replicateAudienceAsHeader() {
		this.#replicateAudienceAsHeader = true;
		return this;
	}
	async encrypt(key, options) {
		const enc = new CompactEncrypt(this.#jwt.data());
		if (this.#protectedHeader && (this.#replicateIssuerAsHeader || this.#replicateSubjectAsHeader || this.#replicateAudienceAsHeader)) this.#protectedHeader = {
			...this.#protectedHeader,
			iss: this.#replicateIssuerAsHeader ? this.#jwt.iss : void 0,
			sub: this.#replicateSubjectAsHeader ? this.#jwt.sub : void 0,
			aud: this.#replicateAudienceAsHeader ? this.#jwt.aud : void 0
		};
		enc.setProtectedHeader(this.#protectedHeader);
		if (this.#iv) enc.setInitializationVector(this.#iv);
		if (this.#cek) enc.setContentEncryptionKey(this.#cek);
		if (this.#keyManagementParameters) enc.setKeyManagementParameters(this.#keyManagementParameters);
		return enc.encrypt(key, options);
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/key/export.js
function omitUndefinedProperties(jwk) {
	return Object.fromEntries(Object.entries(jwk).filter(([, value]) => value !== void 0));
}
async function keyToJWK(key) {
	if (isKeyObject(key)) {
		if (key.type === "secret") key = key.export();
		else return key.export({ format: "jwk" });
	}
	if (key instanceof Uint8Array) return {
		kty: "oct",
		k: encode$1(key)
	};
	if (!isCryptoKey(key)) throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "Uint8Array"));
	if (!key.extractable) throw new TypeError("non-extractable CryptoKey cannot be exported as a JWK");
	const { ext, key_ops, alg, use, ...jwk } = omitUndefinedProperties(await crypto.subtle.exportKey("jwk", key));
	if (jwk.kty === "AKP") jwk.alg = alg;
	return jwk;
}
function exportJWK(key) {
	return keyToJWK(key);
}
//#endregion
//#region node_modules/jose/dist/webapi/jwk/thumbprint.js
var check = (value, description) => {
	if (typeof value !== "string" || !value) throw new JWKInvalid(`${description} missing or invalid`);
};
async function calculateJwkThumbprint(key, digestAlgorithm) {
	let jwk;
	if (isJWK(key)) jwk = key;
	else if (isKeyLike(key)) jwk = await exportJWK(key);
	else throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
	digestAlgorithm ??= "sha256";
	if (digestAlgorithm !== "sha256" && digestAlgorithm !== "sha384" && digestAlgorithm !== "sha512") throw new TypeError("digestAlgorithm must one of \"sha256\", \"sha384\", or \"sha512\"");
	let components;
	switch (jwk.kty) {
		case "AKP":
			check(jwk.alg, "\"alg\" (Algorithm) Parameter");
			check(jwk.pub, "\"pub\" (Public key) Parameter");
			components = {
				alg: jwk.alg,
				kty: jwk.kty,
				pub: jwk.pub
			};
			break;
		case "EC":
			check(jwk.crv, "\"crv\" (Curve) Parameter");
			check(jwk.x, "\"x\" (X Coordinate) Parameter");
			check(jwk.y, "\"y\" (Y Coordinate) Parameter");
			components = {
				crv: jwk.crv,
				kty: jwk.kty,
				x: jwk.x,
				y: jwk.y
			};
			break;
		case "OKP":
			check(jwk.crv, "\"crv\" (Subtype of Key Pair) Parameter");
			check(jwk.x, "\"x\" (Public Key) Parameter");
			components = {
				crv: jwk.crv,
				kty: jwk.kty,
				x: jwk.x
			};
			break;
		case "RSA":
			check(jwk.e, "\"e\" (Exponent) Parameter");
			check(jwk.n, "\"n\" (Modulus) Parameter");
			components = {
				e: jwk.e,
				kty: jwk.kty,
				n: jwk.n
			};
			break;
		case "oct":
			check(jwk.k, "\"k\" (Key Value) Parameter");
			components = {
				k: jwk.k,
				kty: jwk.kty
			};
			break;
		default: throw new JOSENotSupported("\"kty\" (Key Type) Parameter missing or unsupported");
	}
	const data = encode(JSON.stringify(components));
	return encode$1(await digest(digestAlgorithm, data));
}
//#endregion
export { jwtDecrypt as i, EncryptJWT as n, SignJWT as r, calculateJwkThumbprint as t };
