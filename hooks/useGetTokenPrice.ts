import { useQuery } from "@tanstack/react-query";

export const useGetTokenPrice = (
    tokenMint: string | null,
  ) => {
    
    const fetchTokenPrice = async () => {   
        if (!tokenMint) return null;
        try {
          const response = await fetch(
            `https://api-v3.raydium.io/mint/price?mints=${tokenMint}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
  
          if (!response.ok) {
            throw new Error('Raydium API request failed');
          }
  
          const data = await response.json();
  
          // Raydium returns: { success: true, data: { [mint]: "priceAsString" } }
          if (data.success && data.data && data.data[tokenMint]) {
            const priceString = data.data[tokenMint];
            const price = parseFloat(priceString);
            
            if (!isNaN(price)) {
              return {
                price: price,
                source: 'Raydium',
              };
            }
          }
  
          return null;
        } catch (error) {
            console.error('Raydium API error:', error);
            return null;
          }
        }
    return useQuery({
      queryKey: ['getTokenPrice', tokenMint],
      queryFn: fetchTokenPrice,
      enabled: !!tokenMint,
      staleTime: 120000,
    });
  };