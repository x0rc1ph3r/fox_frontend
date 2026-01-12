export const HELIUS_KEY = "0fcc653b-d9ed-4c30-8ad8-6bda0b48da85";
// change to "mainnet" when deploying to mainnet
export const NETWORK : "devnet" | "mainnet" = "devnet";
export const SOLANA_RPC = NETWORK === "devnet" ? "https://api.devnet.solana.com" : "https://solana-mainnet.g.alchemy.com/v2/<Alchemy-key>";
export const API_URL = "";
// export const API_URL = "http://3.39.230.132";