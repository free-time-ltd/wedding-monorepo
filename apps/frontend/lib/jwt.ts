import { jwtVerify, createRemoteJWKSet, decodeJwt } from "jose";

const region = process.env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_POOL_ID;
const JWKS_URL = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyCognitoToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
    });
    return payload;
  } catch (err) {
    console.log(err);
    throw new Error("Invalid token", { cause: err });
  }
}

export function decodeToken(token: string) {
  return decodeJwt(token);
}
