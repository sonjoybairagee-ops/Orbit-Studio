import { SignJWT, jwtVerify } from "jose";

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.LICENSE_JWT_SECRET!);
}

export async function signLicenseToken(
  payload: Record<string, unknown>,
  ttl: string = "2h",
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

export async function verifyLicenseToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}
