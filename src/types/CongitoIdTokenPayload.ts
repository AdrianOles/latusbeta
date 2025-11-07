export interface CognitoIdTokenPayload {
    at_hash: string;
    aud: string;
    auth_time: number;
    'cognito:groups': string[]; // This is the array we're interested in
    'cognito:username': string;
    email: string;
    email_verified: boolean;
    exp: number;
    iat: number;
    identities: Array<{
        dateCreated: string;
        issuer: string | null;
        primary: string;
        providerName: string;
        providerType: string;
        userId: string;
    }>;
    iss: string;
    jti: string;
    nonce: string;
    origin_jti: string;
    picture: string;
    sub: string;
    token_use: string;
}