import { HELIUS_KEY, NETWORK } from "@/constants";
import { useQuery } from "@tanstack/react-query";

export const useGetTokenPrice = (
    tokenMint: string | null,
  ) => {
    
    const fetchTokenPrice = async () => {   
        if (!tokenMint) return null;
        try {
          const response = await fetch(
            `https://${NETWORK}.helius-rpc.com/?api-key=${HELIUS_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: '1',
                method: 'getAsset',
                params: {
                  id: tokenMint,
                  options: {
                    showFungible: true,
                  },
                },
              }),
            }
          );
  
          if (!response.ok) {
            throw new Error('Helius API request failed');
          }
  
          const data = await response.json();
  
          if (data.result?.token_info?.price_info) {
            return {
              price: data.result.token_info.price_info.price_per_token,
              source: 'Helius',
              supply: data.result.token_info.supply,
              decimals: data.result.token_info.decimals,
              symbol: data.result.token_info.symbol,
            };
          }
  
          return null;
        } catch (error) {
            console.error('Helius API error:', error);
            return null;
          }
        }
    return useQuery({
      queryKey: ['getTokenPrice', tokenMint],
      queryFn: fetchTokenPrice,
      enabled: !!tokenMint && !!HELIUS_KEY,
      staleTime: 120000,
    });
  };