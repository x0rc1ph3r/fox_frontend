import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchRaffles } from "../api/rafflesApi"

export const useRaffles = (filter: string) => {
  return useInfiniteQuery({
    queryKey: ["raffles", filter],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchRaffles({ pageParam, filter });
      console.log("Data from useRaffles",data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60000, // 5 minutes
    initialPageParam: 1,
  })
}
