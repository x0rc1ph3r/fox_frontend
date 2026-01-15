import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { VerifiedTokens } from "../src/utils/verifiedTokens";
import { NETWORK } from "@/constants";

export const useFetchUserToken = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const { data: userVerifiedTokens = [], isLoading, error } = useQuery({
        queryKey: ['userTokens', wallet.publicKey?.toString()],
        queryFn: async () => {
            if (!wallet.publicKey) return [];
            console.log('RPC Endpoint:', connection.rpcEndpoint);
            console.log('Wallet Public Key:', wallet.publicKey?.toString());
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                wallet.publicKey,
                { programId: TOKEN_PROGRAM_ID }
            );
            console.log("tokenAccounts", tokenAccounts);

            const userTokenMints = tokenAccounts.value.map(account => 
                account.account.data.parsed.info.mint
            );
            console.log("userTokenMints", userTokenMints);

            const verifiedTokensHeld = VerifiedTokens.filter(verifiedToken => 
                userTokenMints.includes(verifiedToken.address)
            );
            console.log("verifiedTokensHeld", verifiedTokensHeld);

            const tokensWithBalance = verifiedTokensHeld.map(verifiedToken => {
                const tokenAccount = tokenAccounts.value.find(
                    account => account.account.data.parsed.info.mint === verifiedToken.address
                );
                
                return {
                    ...verifiedToken,
                    balance: tokenAccount?.account.data.parsed.info.tokenAmount.uiAmount || 0,
                    decimals: tokenAccount?.account.data.parsed.info.tokenAmount.decimals || 0
                };
            });
            if(NETWORK === "devnet"){
                return VerifiedTokens.filter((token) => (token.address === "So11111111111111111111111111111111111111112" || token.address === "BZfZhBoQSAMQVshvApFzwbKNA3dwuxKhK8m5GVCQ26yG"));
            }
            return tokensWithBalance;
        },
        enabled: !!wallet.publicKey,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    return {
        userVerifiedTokens,
        isLoading,
        error
    };
};