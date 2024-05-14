import { EndorConfig } from "./types/config";

export type TokenResponse = {
    token: string;
    expirationTime: Date;
}

export class AuthenticationService {
    EndorConfig: EndorConfig;

    private tokenResponse: TokenResponse | null = null;

    constructor(EndorConfig: EndorConfig) {
        this.EndorConfig = EndorConfig;
    }

    async auth(): Promise<string> {
        // Check if we already have a valid token
        const currentTime = Date.now();
        if (this.tokenResponse) {
            if (currentTime < this.tokenResponse.expirationTime.getTime()) {
                return this.tokenResponse.token;
            }
        }

        // Fetch a new token if we don't have one or it's expired
        const response = await fetch(`${this.EndorConfig.apiUrl}/v1/auth/api-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.EndorConfig.apiKey,
                secret: this.EndorConfig.apiSecret
            })
        });

        if (!response.ok) {
            throw new Error("Authentication error: " + response.statusText);
        }

        const data: TokenResponse = await response.json();
        this.tokenResponse = {
            token: data.token,
            expirationTime: new Date(data.expirationTime)
        };

        return this.tokenResponse.token;
    }
}