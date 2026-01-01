import { HELIUS_KEY, NETWORK } from "@/constants";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

interface Prize {
  mint: string;
  prizeAmount: string;
  quantity: number;
  decimals?: number;
  isNft?: boolean;
  floorPrice?: string;
}

interface TokenPriceResult {
  price: number;
  decimals: number;
  symbol: string;
}

const fetchTokenPrice = async (tokenMint: string): Promise<TokenPriceResult | null> => {
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
        decimals: data.result.token_info.decimals,
        symbol: data.result.token_info.symbol,
      };
    }

    return null;
  } catch (error) {
    console.error('Helius API error:', error);
    return null;
  }
};

const SOL_MINT = "So11111111111111111111111111111111111111112";

export const useGetTotalPrizeValueInSol = (prizes: Prize[] | undefined) => {
  // Filter out NFT prizes - they use floorPrice directly in SOL
  const tokenPrizes = useMemo(() => {
    if (!prizes || prizes.length === 0) return [];
    return prizes.filter(p => !p.isNft);
  }, [prizes]);

  const nftPrizes = useMemo(() => {
    if (!prizes || prizes.length === 0) return [];
    return prizes.filter(p => p.isNft);
  }, [prizes]);

  // Get unique mints for token prizes only (NFTs don't need price lookups)
  const uniqueMints = useMemo(() => {
    if (tokenPrizes.length === 0) return [SOL_MINT];
    const mints = [...new Set(tokenPrizes.map(p => p.mint))];
    if (!mints.includes(SOL_MINT)) {
      mints.push(SOL_MINT);
    }
    return mints;
  }, [tokenPrizes]);

  const priceQueries = useQueries({
    queries: uniqueMints.map((mint) => ({
      queryKey: ['getTokenPrice', mint],
      queryFn: () => fetchTokenPrice(mint),
      enabled: !!mint && !!HELIUS_KEY,
      staleTime: 120000,
    })),
  });

  const { totalValueInSol, isLoading, isError } = useMemo(() => {
    if (!prizes || prizes.length === 0) {
      return { totalValueInSol: 0, isLoading: false, isError: false };
    }

    const isLoading = priceQueries.some(q => q.isLoading);
    const isError = priceQueries.some(q => q.isError);

    if (isLoading) {
      return { totalValueInSol: 0, isLoading: true, isError: false };
    }

    const priceMap: Record<string, TokenPriceResult> = {};
    uniqueMints.forEach((mint, index) => {
      const data = priceQueries[index]?.data;
      if (data) {
        priceMap[mint] = data;
      }
    });

    const solPriceUsd = priceMap[SOL_MINT]?.price || 0;

    // Calculate NFT value in SOL (floorPrice is in lamports)
    let totalNftValueInSol = 0;
    for (const prize of nftPrizes) {
      if (prize.floorPrice) {
        const floorPriceInSol = parseFloat(prize.floorPrice) / (10 ** 9);
        totalNftValueInSol += floorPriceInSol * prize.quantity;
      }
    }

    // If no token prizes, just return NFT value
    if (tokenPrizes.length === 0) {
      return { totalValueInSol: totalNftValueInSol, isLoading: false, isError: false };
    }

    // Need SOL price to convert token values to SOL
    if (solPriceUsd === 0) {
      return { totalValueInSol: totalNftValueInSol, isLoading: false, isError: true };
    }

    let totalTokenValueUsd = 0;

    for (const prize of tokenPrizes) {
      const tokenPrice = priceMap[prize.mint];
      if (tokenPrice) {
        const decimals = prize.decimals ?? tokenPrice.decimals ?? 9;
        const prizeAmountNum = parseFloat(prize.prizeAmount) / (10 ** decimals);
        const totalAmount = prizeAmountNum * prize.quantity;
        const valueUsd = totalAmount * tokenPrice.price;
        totalTokenValueUsd += valueUsd;
      }
    }

    const tokenValueInSol = totalTokenValueUsd / solPriceUsd;
    const totalSol = tokenValueInSol + totalNftValueInSol;

    return { totalValueInSol: totalSol, isLoading: false, isError };
  }, [prizes, priceQueries, uniqueMints, tokenPrizes, nftPrizes]);

  return {
    totalValueInSol,
    isLoading,
    isError,
    formattedValue: isLoading ? 'Loading...' : `${totalValueInSol.toFixed(4)} SOL`,
  };
};

