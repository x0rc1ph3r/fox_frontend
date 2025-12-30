import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchRaffleById, fetchRaffles } from "../api/rafflesApi"
import type { RaffleTypeBackend } from "../types/backend/raffleTypes";
import { getRaffleWinnersWhoClaimedPrize } from "../api/routes/raffleRoutes";

export const useRaffles = (filter: string) => {
  return useInfiniteQuery({
    queryKey: ["raffles", filter],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchRaffles({ pageParam, filter });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 20000, // 20 seconds
    refetchInterval: 20000, // 20 seconds
    initialPageParam: 1,
  })
}

export const useRaffleById = (raffleId:string) => {
  console.log("raffleId",raffleId);
  return useQuery({
    queryKey: ["raffle", raffleId],
    queryFn: async () => {
      const data = await fetchRaffleById(raffleId);
      return data as RaffleTypeBackend;
    },
    staleTime: 60000,
    enabled: !!raffleId,
  })
}

export const useRaffleWinnersWhoClaimedPrize = (raffleId:string) => {
  return useQuery<{ sender: string }[]>({
    queryKey: ["raffleWinnersWhoClaimedPrize", raffleId],
    queryFn: async () => {
      const data = await getRaffleWinnersWhoClaimedPrize(raffleId);
      return data.prizesClaimed;
    },
    staleTime: 60000,
    enabled: !!raffleId,
  });
}