import { createHash, randomBytes } from "crypto";

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function generateCodeVerifier() {
  return base64UrlEncode(randomBytes(32));
}

export function generateCodeChallenge(codeVerifier: string) {
  return base64UrlEncode(createHash("sha256").update(codeVerifier).digest());
}

export function generateState() {
  return `${Date.now()}-${randomBytes(16).toString("hex")}`;
}

export function generateNonce() {
  return randomBytes(16).toString("hex");
}
