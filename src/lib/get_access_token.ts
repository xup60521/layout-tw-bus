import { env } from "@/lib/env";

export async function get_access_token() {
    const res = await fetch(
      "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: env.client_id,
          client_secret: env.client_secret,
        }),
      },
    );
  
    return (await res.json()) as {
      access_token: string;
    };
  }
  