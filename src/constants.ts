export const HELIUS_KEY = import.meta.env.VITE_HELIUS_KEY as string;
export const NETWORK = import.meta.env.VITE_ENVIRONMENT as string === "development" ? "devnet" : "mainnet";
export const SOLANA_RPC = NETWORK === "devnet" ? import.meta.env.VITE_SOLANA_DEVNET_RPC as string : import.meta.env.VITE_SOLANA_MAINNET_RPC as string;